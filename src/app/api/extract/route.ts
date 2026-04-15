import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { parseDocument, detectFileType } from "@/lib/parser";
import { write } from "@/lib/neo4j";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "@/lib/extraction-prompt";

const anthropic = new Anthropic();

interface ExtractedSection {
  id: string;
  title: string;
  content: string;
  complexity: number;
  purpose: string;
  orderIndex: number;
  dependsOn: string[];
  mentionsConcepts: string[];
}

interface ExtractedConcept {
  id: string;
  name: string;
  definition: string;
  technicalDepth: number;
  relatedConcepts: string[];
}

interface ExtractionResult {
  title: string;
  documentType: string;
  overallComplexity: number;
  audienceAssumptions: string[];
  sections: ExtractedSection[];
  concepts: ExtractedConcept[];
}

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Could not parse form data. Try incognito mode if browser extensions interfere." },
        { status: 400 }
      );
    }
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileType = detectFileType(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await parseDocument(buffer, fileType);

    if (!content.trim()) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    // Truncate to ~100K chars (~50K tokens) to stay within context and keep speed
    const truncatedContent = content.length > 30_000
      ? content.slice(0, 30_000) + "\n\n[... truncated for processing]"
      : content;

    // Pass 1: Claude extracts structure (Haiku for speed — extraction is structured, not creative)
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: EXTRACTION_USER_PROMPT(truncatedContent, file.name) },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "No text response from Claude" }, { status: 500 });
    }

    // Parse JSON from response (handle markdown code blocks and malformed output)
    let jsonStr = textBlock.text.trim();
    // Strip markdown fences
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
    // Find the JSON object if there's extra text around it
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let extracted: ExtractionResult;
    try {
      extracted = JSON.parse(jsonStr);
    } catch {
      // Fix unescaped newlines, tabs, control chars inside JSON string values
      const fixed = jsonStr
        .replace(/[\x00-\x1f]/g, (ch) => {
          if (ch === '\n') return '\\n';
          if (ch === '\r') return '\\r';
          if (ch === '\t') return '\\t';
          return '';
        });
      try {
        extracted = JSON.parse(fixed);
      } catch {
        console.error("Failed to parse Claude response:", jsonStr.slice(0, 500));
        return NextResponse.json(
          { error: "Extraction produced invalid output. Please try again." },
          { status: 502 }
        );
      }
    }

    // Generate document ID
    const docId = `doc-${Date.now()}`;

    // Return response immediately — Neo4j writes happen async
    const response = NextResponse.json({
      documentId: docId,
      title: extracted.title,
      documentType: extracted.documentType,
      sectionCount: extracted.sections.length,
      conceptCount: extracted.concepts.length,
    });

    // Fire-and-forget Neo4j writes — don't block the response
    // 1. Create document
    write(
      `CREATE (d:Document {
        id: $docId, title: $title, documentType: $docType,
        dcFormat: $format, overallComplexity: $complexity,
        audienceAssumptions: $assumptions, rawContent: $content,
        createdAt: datetime(), updatedAt: datetime()
      })`,
      {
        docId,
        title: extracted.title,
        docType: extracted.documentType,
        format: fileType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        complexity: extracted.overallComplexity,
        assumptions: extracted.audienceAssumptions,
        content,
      }
    );

    // 2. Create sections and link to document
    if (extracted.sections.length > 0) {
      write(
        `MATCH (d:Document {id: $docId})
         UNWIND $sections AS sec
         CREATE (s:Section {
           id: sec.id, title: sec.title, content: sec.content,
           complexity: sec.complexity, purpose: sec.purpose, orderIndex: sec.orderIndex
         })
         CREATE (d)-[:HAS_SECTION]->(s)`,
        {
          docId,
          sections: extracted.sections.map((s) => ({
            id: `${docId}-${s.id}`,
            title: s.title,
            content: s.content,
            complexity: s.complexity,
            purpose: s.purpose,
            orderIndex: s.orderIndex,
          })),
        }
      );
    }

    // 3. Create concepts and link to scheme
    if (extracted.concepts.length > 0) {
      write(
        `MATCH (cs:ConceptScheme {id: 'adapt-ai-concepts'})
         UNWIND $concepts AS con
         MERGE (c:Concept {id: con.id})
         SET c.name = con.name, c.definition = con.definition,
             c.technicalDepth = con.technicalDepth, c.createdAt = datetime()
         MERGE (c)-[:IN_SCHEME]->(cs)`,
        {
          concepts: extracted.concepts.map((c) => ({
            id: `${docId}-${c.id}`,
            name: c.name,
            definition: c.definition,
            technicalDepth: c.technicalDepth,
          })),
        }
      );
    }

    // 4. Link sections to concepts
    const sectionConceptLinks: { sectionId: string; conceptId: string }[] = [];
    for (const section of extracted.sections) {
      for (const conceptId of section.mentionsConcepts) {
        sectionConceptLinks.push({
          sectionId: `${docId}-${section.id}`,
          conceptId: `${docId}-${conceptId}`,
        });
      }
    }
    if (sectionConceptLinks.length > 0) {
      write(
        `UNWIND $links AS link
         MATCH (s:Section {id: link.sectionId})
         MATCH (c:Concept {id: link.conceptId})
         CREATE (s)-[:MENTIONS_CONCEPT]->(c)`,
        { links: sectionConceptLinks }
      );
    }

    // 5. Link section dependencies
    const dependencies: { from: string; to: string }[] = [];
    for (const section of extracted.sections) {
      for (const depId of section.dependsOn) {
        dependencies.push({
          from: `${docId}-${section.id}`,
          to: `${docId}-${depId}`,
        });
      }
    }
    if (dependencies.length > 0) {
      write(
        `UNWIND $deps AS dep
         MATCH (s1:Section {id: dep.from})
         MATCH (s2:Section {id: dep.to})
         CREATE (s1)-[:DEPENDS_ON]->(s2)`,
        { deps: dependencies }
      );
    }

    // 6. Link concept relationships
    const conceptRelations: { from: string; to: string }[] = [];
    for (const concept of extracted.concepts) {
      for (const relatedId of concept.relatedConcepts) {
        conceptRelations.push({
          from: `${docId}-${concept.id}`,
          to: `${docId}-${relatedId}`,
        });
      }
    }
    if (conceptRelations.length > 0) {
      write(
        `UNWIND $rels AS rel
         MATCH (c1:Concept {id: rel.from})
         MATCH (c2:Concept {id: rel.to})
         MERGE (c1)-[:SKOS_RELATED]->(c2)`,
        { rels: conceptRelations }
      );
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack?.split("\n").slice(0, 3).join(" | ") : "";
    console.error("Extraction error:", error);
    return NextResponse.json({ error: `${message} [${stack}]` }, { status: 500 });
  }
}
