import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { read, write, toPlain } from "@/lib/neo4j";
import { ADAPTATION_SYSTEM_PROMPT, ADAPTATION_USER_PROMPT } from "@/lib/adaptation-prompt";
import { AudienceProfile, OutputFormat } from "@/lib/types";
import { getCachedAdaptation, isDemoDoc } from "@/lib/demo-cache";
import { judgeAdaptation } from "@/lib/hallucination-judge";

const anthropic = new Anthropic();

export const maxDuration = 60;

const PERSONAS: Record<string, any> = {
  "aud-steve-jony": { id: "aud-steve-jony", name: "Visionary Executive (Steve Jobs + Jony Ive)", technicalDepth: 3, lengthBudget: "brief", focusAreas: ["User Experience", "Product Vision", "Simplification"], terminologyPreference: "accessible", decisionContext: "Why this matters to the human using it." },
  "aud-shreyas-linus": { id: "aud-shreyas-linus", name: "Critical Builder (Linus Torvalds + Shreyas Doshi)", technicalDepth: 5, lengthBudget: "detailed", focusAreas: ["Architecture", "Failure Modes", "Scalability", "Trade-offs"], terminologyPreference: "technical", decisionContext: "Exact architecture, failure modes, what could break." },
  "aud-gary-seth": { id: "aud-gary-seth", name: "Growth Marketer (Gary Vee + Seth Godin)", technicalDepth: 2, lengthBudget: "moderate", focusAreas: ["Distribution", "Platform-Native Content", "Audience Empathy"], terminologyPreference: "accessible", decisionContext: "Hooks, distribution channels, audience psychology." },
  "aud-andrew-ng": { id: "aud-andrew-ng", name: "Andrew Ng (CEO, Landing AI)", technicalDepth: 5, lengthBudget: "brief", focusAreas: ["AI/ML Technical Depth", "Data-Centric AI", "Product-Market Fit"], terminologyPreference: "technical", decisionContext: "Data-centric AI, principled ML, real problem for real users." },
  "aud-eli-chen": { id: "aud-eli-chen", name: "Eli Chen (CTO, AI Fund)", technicalDepth: 5, lengthBudget: "detailed", focusAreas: ["System Architecture", "Scalability", "Technical Debt"], terminologyPreference: "technical", decisionContext: "Can this be built, scaled, maintained by a small team." },
  "aud-mike-rubino": { id: "aud-mike-rubino", name: "Mike Rubino (Head of Talent, AI Fund)", technicalDepth: 3, lengthBudget: "brief", focusAreas: ["Builder Signal", "Execution Velocity", "Leadership Potential"], terminologyPreference: "accessible", decisionContext: "Did they build it or just describe it." },
  "aud-trade-cfo": { id: "aud-trade-cfo", name: "CFO (Import-Heavy Enterprise)", technicalDepth: 2, lengthBudget: "brief", focusAreas: ["Cost Impact", "Budget Exposure", "Risk Mitigation"], terminologyPreference: "business", decisionContext: "How much does this cost us, what's the exposure." },
  "aud-trade-counsel": { id: "aud-trade-counsel", name: "Trade Compliance Counsel", technicalDepth: 5, lengthBudget: "detailed", focusAreas: ["HTS Classification", "Penalty Risk", "Regulatory Timeline"], terminologyPreference: "technical", decisionContext: "Full regulatory detail for compliance filings." },
  "aud-trade-ops": { id: "aud-trade-ops", name: "Supply Chain VP", technicalDepth: 3, lengthBudget: "moderate", focusAreas: ["Supplier Diversification", "Lead Time Impact", "Alternative Sourcing"], terminologyPreference: "business", decisionContext: "Which suppliers affected, where to source alternatives." },
  "aud-health-cmo": { id: "aud-health-cmo", name: "Hospital CMO", technicalDepth: 4, lengthBudget: "moderate", focusAreas: ["Patient Outcomes", "Safety Profile", "Formulary Decision"], terminologyPreference: "technical", decisionContext: "Should this enter the formulary." },
  "aud-health-researcher": { id: "aud-health-researcher", name: "Principal Investigator (PhD)", technicalDepth: 5, lengthBudget: "detailed", focusAreas: ["Study Design", "Statistical Powering", "Confounders"], terminologyPreference: "technical", decisionContext: "Is the study design sound." },
  "aud-health-advocate": { id: "aud-health-advocate", name: "Patient Advocacy Director", technicalDepth: 1, lengthBudget: "brief", focusAreas: ["Patient Experience", "Access", "Hope vs Hype"], terminologyPreference: "accessible", decisionContext: "Does it work, is it safe, when can patients access it." },
};

export async function POST(request: NextRequest) {
  const { documentId, audienceId, formatId } = await request.json();

  if (!documentId || !audienceId || !formatId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Cached demos — return JSON instantly
  const cached = getCachedAdaptation(documentId, audienceId);
  if (cached) {
    return NextResponse.json({
      adaptationId: `demo-${Date.now()}`,
      documentId, audienceId, formatId,
      audienceName: cached.audienceName,
      formatName: cached.formatName,
      adaptedContent: cached.adaptedContent,
      rationale: cached.rationale,
      reliability: cached.reliability,
      wordCount: cached.adaptedContent.split(/\s+/).length,
      generationTime: "0.1s",
    });
  }

  // Real adaptation — stream progress via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      const startTime = Date.now();
      const elapsed = () => ((Date.now() - startTime) / 1000).toFixed(1);

      try {
        // Step 1: Read from Neo4j
        send("progress", { step: "Reading structure...", elapsed: elapsed() });

        let doc: any, sections: any[] = [], concepts: any[] = [];

        if (isDemoDoc(documentId)) {
          doc = { title: "Demo Document" };
          sections = [{ title: "Section 1", content: "Demo content" }];
          concepts = [];
        } else {
          const docRows = await read(
            `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section) RETURN d, s ORDER BY s.orderIndex`,
            { docId: documentId }
          );
          if (docRows.length === 0) {
            send("error", { error: "Document not found. Please re-upload." });
            controller.close(); return;
          }
          doc = toPlain((docRows[0] as Record<string, unknown>).d);
          sections = docRows.map((row) => toPlain((row as Record<string, unknown>).s));

          const conceptRows = await read(
            `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)-[:MENTIONS_CONCEPT]->(c:Concept) RETURN DISTINCT c`,
            { docId: documentId }
          );
          concepts = conceptRows.map((row) => toPlain((row as Record<string, unknown>).c));
        }

        // Step 2: Get persona + format
        send("progress", { step: "Adapting for persona...", elapsed: elapsed() });

        const profile = PERSONAS[audienceId];
        if (!profile) { send("error", { error: `Persona '${audienceId}' not found` }); controller.close(); return; }

        const formatRows = await read(`MATCH (f:OutputFormat {id: $formatId}) RETURN f`, { formatId });
        if (formatRows.length === 0) { send("error", { error: "Output format not found" }); controller.close(); return; }
        const format = toPlain((formatRows[0] as Record<string, unknown>).f) as OutputFormat;

        // Step 3: Claude adaptation
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: ADAPTATION_SYSTEM_PROMPT(profile as AudienceProfile, format),
          messages: [{ role: "user", content: ADAPTATION_USER_PROMPT(doc.title, sections, concepts, format) }],
        });

        const textBlock = message.content.find((b) => b.type === "text");
        if (!textBlock) { send("error", { error: "No response from Claude" }); controller.close(); return; }

        let jsonStr = textBlock.text.trim().replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonStr = jsonMatch[0];

        let adapted;
        try {
          adapted = JSON.parse(jsonStr);
        } catch {
          const fixed = jsonStr.replace(/[\x00-\x1f]/g, (ch) => ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : '');
          try { adapted = JSON.parse(fixed); } catch {
            send("error", { error: "Adaptation produced invalid output. Please retry." });
            controller.close(); return;
          }
        }

        send("progress", { step: "Analyzing gaps...", elapsed: elapsed() });

        // Step 4: LLM Judge
        send("progress", { step: "Validating with independent model...", elapsed: elapsed() });

        const sourceText = sections.map((s: any) => `${s.title}: ${s.content}`).join("\n");
        let reliability = 0;
        let missedGaps: string[] = [];
        try {
          const judgeResult = await judgeAdaptation(sourceText, adapted.adaptedContent, profile.name);
          reliability = judgeResult.reliability;
          missedGaps = judgeResult.missedGaps || [];
        } catch { reliability = 0; }

        send("progress", { step: "Scoring reliability...", elapsed: elapsed() });

        const adaptationId = `adapt-${Date.now()}`;
        const wordCount = adapted.adaptedContent.split(/\s+/).length;
        const generationTime = `${elapsed()}s`;

        // Fire-and-forget Neo4j write
        const termChanges = (adapted.rationale.terminologyChanges || []).map(
          (tc: { original: string; adapted: string; reason: string }) => `${tc.original} → ${tc.adapted}: ${tc.reason}`
        );
        write(
          `MATCH (d:Document {id: $docId}) MATCH (f:OutputFormat {id: $formatId})
           CREATE (ad:Adaptation { id: $adaptationId, adaptedContent: $content, rationaleKept: $kept, rationaleCut: $cut, rationaleSimplified: $simplified, rationaleExpanded: $expanded, terminologyChanges: $termChanges, createdAt: datetime() })
           CREATE (d)-[:HAS_ADAPTATION]->(ad) CREATE (ad)-[:USES_FORMAT]->(f)`,
          { docId: documentId, formatId, adaptationId, content: adapted.adaptedContent, kept: adapted.rationale.kept || [], cut: adapted.rationale.cut || [], simplified: adapted.rationale.simplified || [], expanded: adapted.rationale.expanded || [], termChanges }
        ).catch(() => {});

        // Final result
        send("result", {
          adaptationId, documentId, audienceId, formatId,
          audienceName: profile.name,
          formatName: format.name,
          adaptedContent: adapted.adaptedContent,
          rationale: { ...adapted.rationale, gaps: [...(adapted.rationale.gaps || []), ...missedGaps.map((g: string) => `[Judge] ${g}`)] },
          reliability, wordCount, generationTime,
        });

      } catch (error) {
        send("error", { error: error instanceof Error ? error.message : "Unknown error" });
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}
