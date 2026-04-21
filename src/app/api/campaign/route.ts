import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { read, write, toPlain } from "@/lib/neo4j";
import { swarmReviewCampaign } from "@/lib/swarm-review";

const anthropic = new Anthropic();

export const maxDuration = 120;

const CAMPAIGN_SYSTEM = `You are an elite content strategist and distribution architect operating at the top 0.001% of your field. You combine the distribution instincts of Gary Vaynerchuk, the positioning clarity of Seth Godin, and the platform-native intuition of the best growth teams at Stripe, Linear, and Notion.

Your job: take extracted content about a company/product and produce a complete, executable campaign strategy.

You understand the algorithm rules on every platform:
- LinkedIn: penalizes external links in post body. Lead with pain, not features. First 3 lines must force the "see more" click. Native carousels outperform link posts 4:1.
- X/Twitter: links in replies, not main tweet. Threads perform better than single tweets. Hooks must be provocative or counterintuitive.
- Reddit: zero marketing language. Engineering logs and honest post-mortems get upvoted. Product pitches get destroyed. Match the subreddit culture precisely.
- Instagram: stat-forward captions. 15-20 hashtags in first comment, not caption body. Carousels over single images for retention.
- Substack: depth and specificity. Readers came for insight they can't get elsewhere. Long is fine if every paragraph earns its place.

Return ONLY valid JSON. No markdown fences, no explanatory text outside the JSON.`;

const CAMPAIGN_PROMPT = (
  docContent: string,
  companyPersona: any,
  sections: any[]
) => `
Generate a complete campaign strategy for this content.

Company Persona:
${JSON.stringify(companyPersona, null, 2)}

Document Title: ${docContent}

Key Sections:
${sections.map((s: any, i: number) => `${i + 1}. ${s.title}: ${(s.content || "").substring(0, 200)}`).join("\n")}

Return JSON with this exact structure:
{
  "campaignTitle": "string",
  "keyAngles": [
    {
      "angle": "string (the marketing angle / insight)",
      "why": "string (why this resonates with the audience)",
      "targetPersona": "string (which audience persona this is for)"
    }
  ],
  "hubPlatform": "linkedin | twitter | reddit | instagram | substack",
  "hubRationale": "string",
  "spokePlatforms": ["ordered list"],
  "platformAssets": {
    "linkedin": {
      "type": "post",
      "hook": "string (first line — must force 'see more' click)",
      "body": "string (full post, no external links in body, pain-first)",
      "cta": "string (call to action — goes in first comment with link)",
      "characterCount": "number"
    },
    "twitter": {
      "type": "thread",
      "tweets": [
        {"n": 1, "text": "string (hook tweet, no link)"},
        {"n": 2, "text": "string"},
        {"n": 3, "text": "string"},
        {"n": 4, "text": "string"},
        {"n": 5, "text": "string"},
        {"n": 6, "text": "string (link goes here as reply)"}
      ]
    },
    "reddit": {
      "type": "post",
      "subreddit": "string (most relevant subreddit, no r/ prefix)",
      "title": "string (no marketing language, sounds like an engineer wrote it)",
      "body": "string (engineering log / honest post-mortem style, zero product pitch)"
    },
    "instagram": {
      "type": "carousel_caption",
      "caption": "string (stat-forward, 3-5 sentences max)",
      "hashtags": ["15-20 relevant hashtags, no # prefix in array — will be added to first comment"]
    },
    "substack": {
      "type": "article_lede",
      "title": "string",
      "lede": "string (200-250 word article opening — practitioner depth, specific, no fluff)"
    }
  },
  "publishingSchedule": [
    {
      "day": "number (1=Monday, etc.)",
      "dayName": "string",
      "platform": "string",
      "time": "string (e.g. 9:00 AM PT)",
      "contentType": "string",
      "note": "string (why this day/time for this platform)"
    }
  ],
  "firstHourProtocol": [
    "step 1: ...",
    "step 2: ...",
    "step 3: ..."
  ],
  "flywheel": {
    "description": "string (how each platform feeds back to the hub)",
    "steps": [
      {"from": "string", "to": "string", "mechanism": "string"}
    ]
  },
  "engagementRules": [
    "rule 1: ...",
    "rule 2: ..."
  ],
  "boostTriggers": [
    {"condition": "string", "action": "string"}
  ]
}
`;

export async function POST(request: NextRequest) {
  try {
    const { documentId, personaId, companyName } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    // Load document + sections from Neo4j
    const docRows = await read(
      `MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)
       RETURN d, s ORDER BY s.orderIndex`,
      { docId: documentId }
    );

    if (docRows.length === 0) {
      return NextResponse.json({ error: "Document not found. Re-upload or re-ingest URL." }, { status: 404 });
    }

    const doc = toPlain((docRows[0] as Record<string, unknown>).d);
    const sections = docRows.map((row) => toPlain((row as Record<string, unknown>).s));

    // Load company persona if provided
    let companyPersona: any = null;
    if (personaId) {
      const personaRows = await read(
        `MATCH (p:CompanyPersona {id: $personaId}) RETURN p`,
        { personaId }
      );
      if (personaRows.length > 0) {
        const raw = toPlain((personaRows[0] as Record<string, unknown>).p);
        companyPersona = {
          ...raw,
          audiencePersonas: raw.audiencePersonasJson ? JSON.parse(raw.audiencePersonasJson) : [],
        };
      }
    }

    // Fall back to a minimal persona if none provided
    if (!companyPersona) {
      companyPersona = {
        companyName: companyName || doc.title || "Company",
        domain: doc.documentType || "general",
        voice: { tone: "professional", style: "thought-leadership" },
        hubPlatform: "linkedin",
        spokePlatforms: ["twitter", "reddit", "instagram", "substack"],
        audiencePersonas: doc.audienceAssumptions?.map((a: string, i: number) => ({
          id: `persona-${i}`,
          name: a,
          primaryPlatform: "linkedin",
        })) || [],
      };
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20251001",
      max_tokens: 8192,
      system: CAMPAIGN_SYSTEM,
      messages: [
        {
          role: "user",
          content: CAMPAIGN_PROMPT(doc.title || "Document", companyPersona, sections),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock) {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    let jsonStr = textBlock.text.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let campaign: any;
    try {
      campaign = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse campaign output" }, { status: 500 });
    }

    // ── Swarm review: codex + gemini in parallel ──────────────────────────────
    // Runs only in Node.js (Vercel serverless). Gracefully skipped if CLIs unavailable.
    let swarmReview = null;
    try {
      swarmReview = await swarmReviewCampaign(JSON.stringify(campaign));

      // If swarm found blockers, apply auto-fixes where possible before returning
      if (!swarmReview.passed && swarmReview.codex.blockerCount > 0) {
        const blockers = swarmReview.codex.issues.filter(
          (i) => i.severity === "BLOCKER"
        );

        // Auto-fix: move LinkedIn external links from body to CTA
        const hasLinkedInLinkBlocker = blockers.some(
          (b) => b.platform === "linkedin" && b.issue.toLowerCase().includes("link")
        );
        if (hasLinkedInLinkBlocker && campaign.platformAssets?.linkedin) {
          const body: string = campaign.platformAssets.linkedin.body || "";
          const urlPattern = /https?:\/\/\S+/g;
          const links = body.match(urlPattern) || [];
          if (links.length > 0) {
            campaign.platformAssets.linkedin.body = body.replace(urlPattern, "").replace(/\s{2,}/g, " ").trim();
            campaign.platformAssets.linkedin.cta =
              (campaign.platformAssets.linkedin.cta || "") + " " + links.join(" ");
          }
        }

        // Auto-fix: strip marketing buzzwords from Reddit
        const hasRedditMarketingBlocker = blockers.some(
          (b) => b.platform === "reddit" && b.issue.toLowerCase().includes("marketing")
        );
        if (hasRedditMarketingBlocker && campaign.platformAssets?.reddit?.body) {
          const buzzwords = [
            /\b(revolutionary|game-changing|groundbreaking|cutting-edge|best-in-class|world-class|powerful|seamless)\b/gi,
          ];
          let body = campaign.platformAssets.reddit.body;
          for (const re of buzzwords) body = body.replace(re, "");
          campaign.platformAssets.reddit.body = body.replace(/\s{2,}/g, " ").trim();
        }
      }
    } catch {
      // Swarm review unavailable (CLIs not installed, no keys) — continue without it
      swarmReview = null;
    }

    // Persist campaign to Neo4j
    const campaignId = `campaign-${Date.now()}`;
    write(
      `CREATE (c:Campaign {
        id: $id, documentId: $docId, personaId: $personaId,
        campaignJson: $json, swarmReviewJson: $reviewJson, createdAt: datetime()
      })`,
      {
        id: campaignId,
        docId: documentId,
        personaId: personaId || "",
        json: JSON.stringify(campaign),
        reviewJson: swarmReview ? JSON.stringify(swarmReview) : "",
      }
    ).catch(() => {});

    // Generate the full markdown document
    const markdown = buildCampaignMarkdown(campaign, companyPersona, doc, swarmReview);

    return NextResponse.json({
      campaignId,
      campaign,
      markdown,
      companyPersona,
      documentTitle: doc.title,
      swarmReview,
    });
  } catch (error) {
    console.error("Campaign error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}

function buildCampaignMarkdown(campaign: any, persona: any, doc: any, swarmReview?: any): string {
  const date = new Date().toISOString().split("T")[0];

  const twitterThread = campaign.platformAssets?.twitter?.tweets
    ?.map((t: any) => `**Tweet ${t.n}:** ${t.text}`)
    .join("\n\n") || "";

  const hashtags = campaign.platformAssets?.instagram?.hashtags
    ?.map((h: string) => `#${h}`)
    .join(" ") || "";

  const schedule = campaign.publishingSchedule
    ?.map((s: any) => `| Day ${s.day} (${s.dayName}) | ${s.platform} | ${s.time} | ${s.contentType} | ${s.note} |`)
    .join("\n") || "";

  const flywheel = campaign.flywheel?.steps
    ?.map((s: any) => `- **${s.from} → ${s.to}:** ${s.mechanism}`)
    .join("\n") || "";

  const boostTriggers = campaign.boostTriggers
    ?.map((b: any) => `- **If** ${b.condition} → **Then** ${b.action}`)
    .join("\n") || "";

  return `# Campaign: ${campaign.campaignTitle || doc.title}
**Generated:** ${date}
**Company:** ${persona.companyName || ""}
**Hub Platform:** ${campaign.hubPlatform || ""}

---

## Company Voice Profile

- **Domain:** ${persona.domain || ""}
- **Tone:** ${persona.voice?.tone || ""}
- **Style:** ${persona.voice?.style || ""}
- **Hub:** ${persona.hubPlatform || ""} — ${persona.hubRationale || ""}

---

## Key Marketing Angles

${(campaign.keyAngles || []).map((a: any, i: number) => `### Angle ${i + 1}: ${a.angle}
- **Why it resonates:** ${a.why}
- **Target persona:** ${a.targetPersona}`).join("\n\n")}

---

## Platform Assets

### LinkedIn Post (Hub)

**Hook:**
${campaign.platformAssets?.linkedin?.hook || ""}

**Body:**
${campaign.platformAssets?.linkedin?.body || ""}

**First Comment CTA:**
${campaign.platformAssets?.linkedin?.cta || ""}

---

### X / Twitter Thread

${twitterThread}

---

### Reddit

**Subreddit:** r/${campaign.platformAssets?.reddit?.subreddit || ""}

**Title:** ${campaign.platformAssets?.reddit?.title || ""}

**Post:**
${campaign.platformAssets?.reddit?.body || ""}

---

### Instagram Caption

${campaign.platformAssets?.instagram?.caption || ""}

**Hashtags (first comment):**
${hashtags}

---

### Substack Article Lede

**Title:** ${campaign.platformAssets?.substack?.title || ""}

${campaign.platformAssets?.substack?.lede || ""}

---

## Campaign Management Plan

### Hub-and-Spoke Flywheel

**Hub:** ${campaign.hubPlatform}
**Spokes:** ${(campaign.spokePlatforms || []).join(", ")}

${flywheel}

---

### Publishing Schedule

| Day | Platform | Time | Content | Notes |
|---|---|---|---|---|
${schedule}

---

### First-Hour Protocol

${(campaign.firstHourProtocol || []).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

---

### Engagement Rules

${(campaign.engagementRules || []).map((r: string) => `- ${r}`).join("\n")}

---

### Boost Triggers

${boostTriggers}
`;
}
