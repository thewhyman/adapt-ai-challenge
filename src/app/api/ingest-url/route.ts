import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { write } from "@/lib/neo4j";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "@/lib/extraction-prompt";

const anthropic = new Anthropic();

export const maxDuration = 60;

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

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Fetch the URL content
    let content: string;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; xTeamOS/1.0; +https://thewhyman.com)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        return NextResponse.json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 400 });
      }
      const html = await response.text();
      // Strip HTML tags to get readable text
      content = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
    } catch (err) {
      return NextResponse.json({ error: `Could not fetch URL: ${String(err)}` }, { status: 400 });
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "No readable content found at URL" }, { status: 400 });
    }

    // Truncate to ~30K chars for speed
    const truncatedContent = content.length > 30_000
      ? content.slice(0, 30_000) + "\n\n[... truncated for processing]"
      : content;

    const fileName = new URL(url).hostname + new URL(url).pathname;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: EXTRACTION_USER_PROMPT(truncatedContent, fileName) },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "No text response from Claude" }, { status: 500 });
    }

    let jsonStr = textBlock.text.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let extracted: ExtractionResult;
    try {
      extracted = JSON.parse(jsonStr);
    } catch {
      const fixed = jsonStr.replace(/[\x00-\x1f]/g, (ch) => {
        if (ch === '\n') return '\\n';
        if (ch === '\r') return '\\r';
        if (ch === '\t') return '\\t';
        return '';
      });
      try {
        extracted = JSON.parse(fixed);
      } catch {
        extracted = {
          title: new URL(url).hostname,
          documentType: "general",
          overallComplexity: 3,
          audienceAssumptions: ["General audience"],
          sections: [{
            id: "section-1", title: "Full Content", content: truncatedContent.substring(0, 300),
            complexity: 3, purpose: "core_argument", orderIndex: 0, dependsOn: [], mentionsConcepts: []
          }],
          concepts: []
        };
      }
    }

    const docId = `doc-${Date.now()}`;

    await write(
      `CREATE (d:Document {
        id: $docId, title: $title, documentType: $docType,
        dcFormat: 'text/html', overallComplexity: $complexity,
        audienceAssumptions: $assumptions, rawContent: $content,
        sourceUrl: $url, createdAt: datetime(), updatedAt: datetime()
      })`,
      {
        docId,
        title: extracted.title,
        docType: extracted.documentType,
        complexity: extracted.overallComplexity,
        assumptions: extracted.audienceAssumptions,
        content: truncatedContent,
        url,
      }
    );

    if (extracted.sections.length > 0) {
      await write(
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

    if (extracted.concepts.length > 0) {
      write(
        `MATCH (d:Document {id: $docId})
         UNWIND $concepts AS c
         CREATE (concept:Concept {
           id: c.id, name: c.name, definition: c.definition, technicalDepth: c.depth
         })
         MERGE (scheme:ConceptScheme {id: $schemeId})
         CREATE (concept)-[:IN_SCHEME]->(scheme)`,
        {
          docId,
          schemeId: `scheme-${docId}`,
          concepts: extracted.concepts.map((c) => ({
            id: `${docId}-${c.id}`,
            name: c.name,
            definition: c.definition,
            depth: c.technicalDepth,
          })),
        }
      ).catch(() => {});
    }

    return NextResponse.json({
      documentId: docId,
      title: extracted.title,
      documentType: extracted.documentType,
      overallComplexity: extracted.overallComplexity,
      audienceAssumptions: extracted.audienceAssumptions,
      sectionCount: extracted.sections.length,
      conceptCount: extracted.concepts.length,
      sourceUrl: url,
    });
  } catch (error) {
    console.error("URL ingestion error:", error);
    return NextResponse.json({ error: "Failed to ingest URL" }, { status: 500 });
  }
}
