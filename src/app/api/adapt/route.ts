import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { read, write, toPlain } from "@/lib/neo4j";
import { ADAPTATION_SYSTEM_PROMPT, ADAPTATION_USER_PROMPT } from "@/lib/adaptation-prompt";
import { AudienceProfile, OutputFormat } from "@/lib/types";
import { getCachedAdaptation, isDemoDoc } from "@/lib/demo-cache";
import { judgeAdaptation } from "@/lib/hallucination-judge";

const anthropic = new Anthropic();

export const maxDuration = 60;

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

    // CACHED DEMO: Return instant pre-computed results — zero LLM calls
    const cached = getCachedAdaptation(documentId, audienceId);
    if (cached) {
      return NextResponse.json({
        adaptationId: `demo-${Date.now()}`,
        documentId,
        audienceId,
        audienceName: cached.audienceName,
        formatId,
        formatName: cached.formatName,
        adaptedContent: cached.adaptedContent,
        rationale: cached.rationale,
        reliability: cached.reliability,
      });
    }

    // REMOVED — old inline cache replaced by demo-cache.ts module
    if (false) {
      const _REMOVED = {
        "_unused": {
          adaptedContent: "## Why Apollo Matters\n\nPalantir solved a problem nobody else would touch: **how do you push software updates to places with no internet?**\n\nThink military bases in remote locations, oil rigs, classified government facilities — environments where \"just deploy to the cloud\" is laughable. These are places where a failed update doesn't mean a support ticket. It means people can't do their jobs.\n\n### The Core Insight\n\nMost deployment systems assume connectivity. Apollo assumes the opposite. It packages everything — code, dependencies, configuration — into a self-contained unit that can evaluate its own environment, decide if it's safe to deploy, and roll back autonomously if something breaks.\n\nNo human in the loop. No phone-home to a central server. The software makes the call.\n\n### What Makes This Different\n\n**Autonomous decision-making at the edge.** The control plane doesn't just push updates — it reasons about constraints. Network bandwidth, hardware capabilities, security clearances, dependency conflicts. If the math doesn't work, it doesn't deploy. If it deploys and something breaks, it reverses itself.\n\n**This is the future of all software deployment**, not just defense. Every enterprise with distributed operations — retail stores, hospital networks, manufacturing floors — faces the same problem: unreliable connectivity and zero tolerance for failed updates.\n\n### The Bottom Line\n\nApollo turns deployment from a prayer into a guarantee. Ship anywhere, verify locally, fail safely.",
          rationale: { kept: ["Core autonomous deployment concept — the product's reason to exist", "Edge computing and disconnected environment focus — key differentiator", "Self-healing rollback — trust-builder for risk-averse buyers"], simplified: ["Control plane architecture → 'reasons about constraints'", "Dependency resolution → 'packages everything into a self-contained unit'", "Network topology → 'places with no internet'"], expanded: ["Added real-world analogies (military bases, oil rigs, hospitals)", "Connected to broader industry trend beyond defense", "Reframed rollback as emotional benefit: 'prayer into guarantee'"], cut: ["API specification details — irrelevant at this altitude", "Version compatibility matrices — operational detail", "Benchmark numbers — story matters more than metrics here"], terminologyChanges: [{ original: "Continuous Deployment Pipeline", adapted: "autonomous update system", reason: "Outcomes, not DevOps jargon" }, { original: "Air-gapped environments", adapted: "places with no internet", reason: "Visceral and immediate" }, { original: "Constraint satisfaction engine", adapted: "reasons about constraints", reason: "Humanized — the system thinks, not computes" }], gaps: ["ROI metrics — this persona needs cost-of-failure vs. cost-of-Apollo comparison. Ask author: What is the average cost of a failed deployment in your target environments?", "Customer proof points — a Visionary Executive wants to see who else bet on this. Ask author: Which organizations have deployed Apollo and what were their before/after deployment success rates?", "Timeline to value — how fast does a team go from install to first autonomous deployment? Ask author: What is the typical onboarding timeline?"] }
        },
        "aud-shreyas-linus": {
          adaptedContent: "## Apollo: Architecture Assessment\n\n### What It Actually Does\n\nApollo is a deployment orchestrator for air-gapped and intermittently-connected environments. The core loop:\n\n1. **Package** — Bundles application code, runtime dependencies, and configuration into a versioned, signed artifact\n2. **Evaluate** — On-device constraint solver checks: available disk, memory, CPU, network state, dependency versions, security policy compliance\n3. **Deploy or Abort** — If all constraints pass → deploy atomically. If any fail → abort with structured error. No partial states.\n4. **Monitor + Rollback** — Post-deploy health checks against defined SLIs. Automatic rollback if SLIs breach thresholds within a configurable window.\n\n### The Hard Technical Problem\n\nThe constraint solver runs **entirely locally** with zero connectivity assumptions. This means:\n- No remote config fetches during evaluation\n- Dependency resolution must be pre-computed and bundled\n- Rollback must work without phoning home\n- Clock drift across disconnected nodes is a real edge case for versioning\n\n### Architecture Trade-offs\n\n**Chose correctness over speed.** The constraint evaluation is synchronous and blocking. A complex deployment with 50+ constraints takes measurable time. They chose safety over velocity — the right call for defense, potentially wrong for CI/CD-heavy commercial environments.\n\n**Chose bundling over streaming.** Artifacts are monolithic packages, not incremental diffs. This means larger transfer sizes but eliminates partial-update failure modes. Again, optimized for reliability in constrained environments.\n\n### What Could Break\n\n- **Constraint explosion** at scale — O(n²) worst case when dependencies have cross-constraints\n- **No canary/progressive rollout** — it's all-or-nothing per node\n- **Artifact size** — bundling everything means large packages on bandwidth-constrained links\n\n### Verdict\n\nSolid engineering for its target domain. The architecture is intentionally conservative — every trade-off favors reliability over velocity. Would not use this for a web app with 10 deploys/day. Would absolutely use this for anything where a failed deploy has physical-world consequences.",
          rationale: { kept: ["Full deployment lifecycle (package → evaluate → deploy → rollback)", "Constraint solver architecture — the core technical differentiator", "Trade-off analysis — correctness vs speed, bundling vs streaming"], simplified: ["Marketing language stripped — replaced with technical specifics", "Buzzwords → concrete mechanisms"], expanded: ["Added failure mode analysis (constraint explosion, no canary, artifact size)", "Added explicit architecture trade-offs with reasoning", "Added verdict with use-case boundaries"], cut: ["Business value propositions — this audience wants architecture, not ROI", "Customer testimonials and case studies", "Competitive positioning"], terminologyChanges: [{ original: "autonomous continuous deployment", adapted: "deployment orchestrator for air-gapped environments", reason: "Precise technical description vs marketing" }, { original: "secure node", adapted: "versioned, signed artifact", reason: "Specific artifact format matters to this audience" }, { original: "evaluates environment constraints", adapted: "on-device constraint solver", reason: "Names the actual pattern" }] }
        },
        "aud-gary-seth": {
          adaptedContent: "## Stop Deploying Software. Start Deploying Confidence.\n\n**The hook:** Every DevOps team has a war story about The Deploy That Broke Everything. Apollo makes that story impossible.\n\n### The LinkedIn Post Version\n\n*\"We used to pray before every deployment to our edge sites. Literally. Now we press a button and go home.\"*\n— (This is the customer testimonial you want to lead every campaign with)\n\n### Platform-Native Angles\n\n**For LinkedIn (B2B decision-makers):**\nLead with the cost of failure. \"A single failed deployment to an air-gapped site costs $50-200K in engineer travel, physical access, and blind debugging. Apollo eliminates 95% of those failures. The math is obvious.\"\n\n**For Twitter/X (developer audience):**\n\"What if your deployment system was smarter than your best SRE? Apollo evaluates 50+ constraints before deploying and rolls back faster than you can open a terminal. No internet required.\"\n\n**For Blog/Newsletter (thought leadership):**\nThe future of deployment isn't faster CI/CD. It's autonomous systems that reason about their environment the way humans do — except they never panic, never forget a dependency, and never deploy on a Friday at 4:59 PM.\n\n### The Campaign Arc\n\n**Day 1 (curiosity):** Customer war story + \"there's a better way\" tease\n**Day 2 (conversion):** Live demo video showing deploy → constraint check → autonomous rollback in 30 seconds\n**Day 3 (credibility):** Technical deep-dive blog on the constraint solver architecture\n\n### The One-Line Pitch\n\n\"Apollo is autopilot for software deployment — it flies the plane, checks the weather, and lands safely even when the tower goes dark.\"",
          rationale: { kept: ["The core value prop — autonomous, reliable deployment", "The emotional hook — fear of failed deployments is universal", "The constraint solver as differentiator — it's the 'how' behind the magic"], simplified: ["Technical architecture → autopilot metaphor", "Air-gapped environments → 'when the tower goes dark'", "Constraint satisfaction → 'reasons about its environment the way humans do'"], expanded: ["Platform-specific content angles (LinkedIn, Twitter, blog)", "Campaign arc (curiosity → conversion → credibility)", "Customer testimonial framing — the story sells, not the spec"], cut: ["All internal architecture details — marketers don't distribute architecture diagrams", "Benchmark numbers without context — replaced with emotional cost framing", "Competitive positioning — lead with customer pain, not competitor weakness"], terminologyChanges: [{ original: "Continuous Deployment Pipeline", adapted: "autopilot for software deployment", reason: "Metaphor > jargon for every distribution channel" }, { original: "constraint satisfaction engine", adapted: "smarter than your best SRE", reason: "Personified comparison creates instant understanding" }, { original: "autonomous rollback", adapted: "lands safely even when the tower goes dark", reason: "Visceral image that works on LinkedIn AND Twitter" }], gaps: ["Customer war story — the campaign arc needs a REAL customer quote, not a placeholder. Ask author: Can you provide a named customer testimonial about deployment pain before Apollo?", "Demo video content — Day 2 conversion needs a 30-second screen recording of deploy → constraint check → rollback. Ask author: Can you provide or record a live demo?", "Competitive positioning — what do teams currently use instead? Ask author: What are the top 3 alternatives your customers evaluated before choosing Apollo?"] }
        }
      };

      const cached = DEMO_CACHE[audienceId];
      if (cached) {
        const audienceNames: Record<string, string> = {
          "aud-steve-jony": "The Visionary Executive (Steve Jobs + Jony Ive)",
          "aud-shreyas-linus": "The Critical Builder (Linus Torvalds + Shreyas Doshi)",
          "aud-gary-seth": "The Growth Marketer (Gary Vee + Seth Godin)"
        };
        return NextResponse.json({
          adaptationId: `demo-${Date.now()}`,
          documentId,
          audienceId,
          audienceName: audienceNames[audienceId] || audienceId,
          formatId,
          formatName: formatId,
          adaptedContent: cached.adaptedContent,
          rationale: cached.rationale,
        });
      }
    }

    // Non-cached demo path — still bypass Neo4j for doc content
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

    // 3. Read audience profile (Co-Dialectic Persona Fusion Engine)
    const CO_DIALECTIC_PERSONAS = [
      { id: "aud-steve-jony", name: "The Visionary Executive (Steve Jobs + Jony Ive)", technicalDepth: 3 as const, lengthBudget: "brief" as const, focusAreas: ["User Experience", "Product Market Fit", "Simplification", "Why It Matters"], terminologyPreference: "accessible" as const, decisionContext: "Focuses entirely on why this matters to the human using it, stripping away all technical bloat or generic corporate speak. Thinks in product vision and human impact." },
      { id: "aud-shreyas-linus", name: "The Critical Builder (Linus Torvalds + Shreyas Doshi)", technicalDepth: 5 as const, lengthBudget: "detailed" as const, focusAreas: ["Architecture", "Edge Cases", "Scalability", "Trade-offs", "Failure Modes"], terminologyPreference: "technical" as const, decisionContext: "Ruthlessly pragmatic. Demands exact technical architecture, failure modes, and why this doesn't over-engineer the core problem. Show the code-level truth." },
      { id: "aud-gary-seth", name: "The Growth Marketer (Gary Vee + Seth Godin)", technicalDepth: 2 as const, lengthBudget: "moderate" as const, focusAreas: ["Distribution", "Platform-Native Content", "Audience Empathy", "Social Proof", "Content That Spreads"], terminologyPreference: "accessible" as const, decisionContext: "Thinks in hooks, distribution channels, and audience psychology. Adapts content for social platforms, marketing campaigns, and customer-facing formats. Makes every piece of content work harder across LinkedIn, Twitter, blogs, and sales decks." }
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
      system: ADAPTATION_SYSTEM_PROMPT(profile as AudienceProfile, format),
      messages: [
        {
          role: "user",
          content: ADAPTATION_USER_PROMPT(doc.title, sections, concepts, format),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
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

    // Multi-model hallucination judge (OpenAI GPT validates Claude's output)
    const sourceText = sections.map((s: any) => `${s.title}: ${s.content}`).join("\n");
    let reliability = 0;
    let judgeResult = null;
    try {
      judgeResult = await judgeAdaptation(sourceText, adapted.adaptedContent, profile.name);
      reliability = judgeResult.reliability;
    } catch {
      reliability = 0;
    }

    return NextResponse.json({
      adaptationId,
      documentId,
      audienceId,
      audienceName: profile.name,
      formatId,
      formatName: format.name,
      adaptedContent: adapted.adaptedContent,
      rationale: {
        ...adapted.rationale,
        gaps: [
          ...(adapted.rationale.gaps || []),
          ...(judgeResult?.missedGaps?.map((g: string) => `[Judge-identified] ${g}`) || [])
        ]
      },
      reliability,
      hallucinations: judgeResult?.hallucinations || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Adaptation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
