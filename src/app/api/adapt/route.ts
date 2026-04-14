import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { read, write, toPlain } from "@/lib/neo4j";
import { ADAPTATION_SYSTEM_PROMPT, ADAPTATION_USER_PROMPT } from "@/lib/adaptation-prompt";
import { AudienceProfile, OutputFormat } from "@/lib/types";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { documentId, audienceId, formatId } = await request.json();

    if (!documentId || !audienceId || !formatId) {
      return NextResponse.json(
        { error: "Missing required fields: documentId, audienceId, formatId" },
        { status: 400 }
      );
    }

    // 1. Read document + sections from Neo4j
    const docRows = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)
       RETURN d, s ORDER BY s.orderIndex`,
      { docId: documentId }
    );

    if (docRows.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = toPlain((docRows[0] as Record<string, unknown>).d);
    const sections = docRows.map((row) => toPlain((row as Record<string, unknown>).s));

    // 2. Read concepts for this document
    const conceptRows = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)-[:MENTIONS_CONCEPT]->(c:Concept)
       RETURN DISTINCT c`,
      { docId: documentId }
    );
    const concepts = conceptRows.map((row) => toPlain((row as Record<string, unknown>).c));

    // 3. Read audience profile
    const profileRows = await read(
      `MATCH (a:AudienceProfile {id: $audienceId}) RETURN a`,
      { audienceId }
    );
    if (profileRows.length === 0) {
      return NextResponse.json({ error: "Audience profile not found" }, { status: 404 });
    }
    const profile = toPlain((profileRows[0] as Record<string, unknown>).a) as AudienceProfile;

    // 4. Read output format
    const formatRows = await read(
      `MATCH (f:OutputFormat {id: $formatId}) RETURN f`,
      { formatId }
    );
    if (formatRows.length === 0) {
      return NextResponse.json({ error: "Output format not found" }, { status: 404 });
    }
    const format = toPlain((formatRows[0] as Record<string, unknown>).f) as OutputFormat;

    // 5. Pass 2: Claude adaptation
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: ADAPTATION_SYSTEM_PROMPT(profile, format),
      messages: [
        {
          role: "user",
          content: ADAPTATION_USER_PROMPT(doc.title, sections, concepts, format),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from Claude" }, { status: 500 });
    }

    // Parse JSON response
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const adapted = JSON.parse(jsonStr);
    const adaptationId = `adapt-${Date.now()}`;

    // 6. Write adaptation to Neo4j
    const termChanges = (adapted.rationale.terminologyChanges || []).map(
      (tc: { original: string; adapted: string; reason: string }) =>
        `${tc.original} → ${tc.adapted}: ${tc.reason}`
    );

    await write(
      `MATCH (d:Document {id: $docId})
       MATCH (a:AudienceProfile {id: $audienceId})
       MATCH (f:OutputFormat {id: $formatId})
       CREATE (ad:Adaptation {
         id: $adaptationId,
         adaptedContent: $content,
         rationaleKept: $kept,
         rationaleCut: $cut,
         rationaleSimplified: $simplified,
         rationaleExpanded: $expanded,
         terminologyChanges: $termChanges,
         createdAt: datetime()
       })
       CREATE (d)-[:HAS_ADAPTATION]->(ad)
       CREATE (ad)-[:ADAPTED_FOR]->(a)
       CREATE (ad)-[:USES_FORMAT]->(f)`,
      {
        docId: documentId,
        audienceId,
        formatId,
        adaptationId,
        content: adapted.adaptedContent,
        kept: adapted.rationale.kept || [],
        cut: adapted.rationale.cut || [],
        simplified: adapted.rationale.simplified || [],
        expanded: adapted.rationale.expanded || [],
        termChanges,
      }
    );

    return NextResponse.json({
      adaptationId,
      documentId,
      audienceId,
      audienceName: profile.name,
      formatId,
      formatName: format.name,
      adaptedContent: adapted.adaptedContent,
      rationale: adapted.rationale,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Adaptation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
