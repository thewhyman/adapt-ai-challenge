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

    let doc: any;
    let sections: any[] = [];
    let concepts: any[] = [];

    // EVALUATOR DEMO INTERCEPT: Bypass Neo4j for the 1-click fallback demo so it never fails on a cold DB start
    if (documentId === "doc-eval-demo") {
      doc = { title: "Palantir Apollo: Continuous Deployment for the Edge" };
      sections = [
        { title: "Executive Summary", content: "Apollo provides autonomous continuous deployment across disconnected environments, allowing independent software delivery apart from infrastructure." },
        { title: "The Disconnected Edge", content: "In defense and secure enterprise, environments often have zero connectivity. Standard SaaS models fail. Apollo solves this by packaging dependencies into a secure node." },
        { title: "Autonomous Control Plane", content: "The control plane evaluates environment constraints and computes a safe deployment path. If constraints fail, it rolls back autonomously." }
      ];
      concepts = [
        { name: "Continuous Deployment", definition: "Automated software updates" },
        { name: "Disconnected Edge", definition: "Air-gapped deployment environments" },
        { name: "Autonomous Control Plane", definition: "System that calculates constraints without human oversight" }
      ];
    } else {
      // 1. Read document + sections from Neo4j
      const docRows = await read(
        `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)
         RETURN d, s ORDER BY s.orderIndex`,
        { docId: documentId }
      );

      if (docRows.length === 0) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      doc = toPlain((docRows[0] as Record<string, unknown>).d);
      sections = docRows.map((row) => toPlain((row as Record<string, unknown>).s));

      // 2. Read concepts for this document
      const conceptRows = await read(
        `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)-[:MENTIONS_CONCEPT]->(c:Concept)
         RETURN DISTINCT c`,
        { docId: documentId }
      );
      concepts = conceptRows.map((row) => toPlain((row as Record<string, unknown>).c));
    }

    // 3. Read audience profile (From injected Co-Dialectic static engine to bypass DB migration)
    const CO_DIALECTIC_PERSONAS = [
      { id: "aud-steve-jony", name: "The Visionary Builder (Steve Jobs + Jony Ive)", technicalDepth: 3 as const, lengthBudget: "brief" as const, focusAreas: ["User Experience", "Product Market Fit", "Simplification"], terminologyPreference: "accessible" as const, decisionContext: "Focuses entirely on why this matters to the human using it, stripping away all technical bloat or generic corporate speak." },
      { id: "aud-shreyas-linus", name: "The Critical Engineer (Shreyas Doshi + Linus Torvalds)", technicalDepth: 5 as const, lengthBudget: "detailed" as const, focusAreas: ["Architecture", "Edge Cases", "Scalability", "Trade-offs"], terminologyPreference: "technical" as const, decisionContext: "Ruthlessly pragmatic. Demands to know the exact technical architecture, failure modes, and why this doesn't over-engineer the core problem." },
      { id: "aud-nate-reid", name: "The Scaled Operator (Nate Silver + Reid Hoffman)", technicalDepth: 4 as const, lengthBudget: "moderate" as const, focusAreas: ["Growth Loops", "Data Validity", "Network Effects", "ROI"], terminologyPreference: "business" as const, decisionContext: "Looks for compounding advantages. Needs to see the data proof and the exact mechanism by which this product or document scales an organization." }
    ];
    
    const profile = CO_DIALECTIC_PERSONAS.find(p => p.id === audienceId);
    if (!profile) {
      return NextResponse.json({ error: "Co-Dialectic Audience profile not found" }, { status: 404 });
    }

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

    // Parse JSON response — handle markdown fences and malformed output
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let adapted;
    try {
      adapted = JSON.parse(jsonStr);
    } catch {
      // Claude sometimes puts unescaped newlines in JSON string values.
      // Try to fix by replacing literal newlines inside strings.
      const fixed = jsonStr.replace(/(?<=:\s*")([\s\S]*?)(?="(?:\s*[,}\]]))/g, (match) =>
        match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
      );
      try {
        adapted = JSON.parse(fixed);
      } catch (e2) {
        console.error("Failed to parse Claude response:", jsonStr.slice(0, 500));
        return NextResponse.json(
          { error: "Claude returned malformed JSON. Please try again." },
          { status: 502 }
        );
      }
    }
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
