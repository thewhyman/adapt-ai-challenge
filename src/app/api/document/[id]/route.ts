import { NextRequest, NextResponse } from "next/server";
import { read, toPlain } from "@/lib/neo4j";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: docId } = await params;

    // Fetch document
    const docs = await read(
      `MATCH (d:Document {id: $docId}) RETURN d`,
      { docId }
    );

    if (docs.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Fetch sections with their dependencies and concept links
    const rawSections = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)
       OPTIONAL MATCH (s)-[:DEPENDS_ON]->(dep:Section)
       OPTIONAL MATCH (s)-[:MENTIONS_CONCEPT]->(c:Concept)
       RETURN s,
              collect(DISTINCT dep.id) AS dependsOn,
              collect(DISTINCT c.id) AS mentionsConcepts
       ORDER BY s.orderIndex`,
      { docId }
    );

    // Fetch concepts with their scheme and relations
    const rawConcepts = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)-[:MENTIONS_CONCEPT]->(c:Concept)
       OPTIONAL MATCH (c)-[:IN_SCHEME]->(cs:ConceptScheme)
       OPTIONAL MATCH (c)-[:SKOS_RELATED]->(related:Concept)
       RETURN DISTINCT c,
              cs.id AS schemeId,
              cs.title AS schemeTitle,
              collect(DISTINCT related.id) AS relatedConcepts`,
      { docId }
    );

    // Fetch adaptations if any
    const rawAdaptations = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_ADAPTATION]->(ad:Adaptation)
       MATCH (ad)-[:ADAPTED_FOR]->(ap:AudienceProfile)
       MATCH (ad)-[:USES_FORMAT]->(f:OutputFormat)
       RETURN ad, ap.id AS audienceId, ap.name AS audienceName,
              f.id AS formatId, f.name AS formatName
       ORDER BY ad.createdAt DESC`,
      { docId }
    );

    // toPlain each row first (converts Neo4j Nodes to plain objects), then reshape
    const document = toPlain((docs[0] as Record<string, unknown>).d);

    const sections = rawSections.map((row) => {
      const r = toPlain(row) as Record<string, unknown>;
      return { ...(r.s as object), dependsOn: r.dependsOn, mentionsConcepts: r.mentionsConcepts };
    });

    const concepts = rawConcepts.map((row) => {
      const r = toPlain(row) as Record<string, unknown>;
      return { ...(r.c as object), schemeId: r.schemeId, schemeTitle: r.schemeTitle, relatedConcepts: r.relatedConcepts };
    });

    const adaptations = rawAdaptations.map((row) => {
      const r = toPlain(row) as Record<string, unknown>;
      return { ...(r.ad as object), audienceId: r.audienceId, audienceName: r.audienceName, formatId: r.formatId, formatName: r.formatName };
    });

    return NextResponse.json({ document, sections, concepts, adaptations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Document fetch error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
