import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { write } from "@/lib/neo4j";

const anthropic = new Anthropic();

export const maxDuration = 60;

const PERSONA_BUILDER_SYSTEM = `You are an expert brand strategist and audience analyst. 
Given a company's website content or product documentation, you extract:
1. The company's voice and tone
2. Their domain expertise
3. Their target audience personas (who BUYS from them)
4. The best hub platform for their content distribution
5. Platform-specific voice rules for their brand

Return ONLY valid JSON. No markdown fences, no explanatory text.`;

const PERSONA_BUILDER_PROMPT = (content: string, companyName: string) => `
Analyze this content from ${companyName} and extract their brand persona.

Content:
---
${content}
---

Return JSON with this exact structure:
{
  "companyName": "string",
  "domain": "string (e.g. supply chain AI, developer tools, consumer hardware)",
  "voice": {
    "tone": "string (e.g. authoritative, conversational, technical, approachable)",
    "style": "string (e.g. data-driven, story-driven, product-led, thought-leadership)",
    "keywords": ["top brand terms and phrases they use"],
    "avoids": ["language or tone they clearly avoid"]
  },
  "audiencePersonas": [
    {
      "id": "string (slug, e.g. vp-supply-chain)",
      "name": "string (role title)",
      "description": "string (1-2 sentences: who they are, what they care about)",
      "painPoints": ["top 3 pain points this audience has"],
      "primaryPlatform": "linkedin | twitter | reddit | instagram | email | github",
      "contentPreference": "technical | strategic | emotional | data-driven"
    }
  ],
  "hubPlatform": "linkedin | twitter | reddit | instagram | substack | github",
  "hubRationale": "string (why this platform is the hub for this company's audience)",
  "spokePlatforms": ["ordered list of supporting platforms"],
  "distributionRules": [
    "platform-specific rule 1 (e.g. LinkedIn: lead with operational pain, not product features)",
    "platform-specific rule 2",
    "platform-specific rule 3"
  ]
}
`;

export async function POST(request: NextRequest) {
  try {
    const { url, companyName, documentId } = await request.json();

    if (!url && !documentId) {
      return NextResponse.json({ error: "Either url or documentId required" }, { status: 400 });
    }

    let content = "";
    let resolvedCompanyName = companyName || "Unknown Company";

    if (url) {
      // Fetch website content
      try {
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; xTeamOS/1.0)" },
          signal: AbortSignal.timeout(15000),
        });
        const html = await response.text();
        content = html
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim()
          .slice(0, 20_000);
        if (!resolvedCompanyName || resolvedCompanyName === "Unknown Company") {
          resolvedCompanyName = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
        }
      } catch (err) {
        return NextResponse.json({ error: `Could not fetch URL: ${String(err)}` }, { status: 400 });
      }
    }

    if (!content) {
      return NextResponse.json({ error: "No content to analyze" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: PERSONA_BUILDER_SYSTEM,
      messages: [
        { role: "user", content: PERSONA_BUILDER_PROMPT(content, resolvedCompanyName) },
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

    let persona: any;
    try {
      persona = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse persona from Claude response" }, { status: 500 });
    }

    const personaId = `persona-${Date.now()}`;

    // Persist the company persona to Neo4j
    await write(
      `CREATE (p:CompanyPersona {
        id: $id,
        companyName: $companyName,
        domain: $domain,
        voiceTone: $voiceTone,
        voiceStyle: $voiceStyle,
        voiceKeywords: $voiceKeywords,
        voiceAvoids: $voiceAvoids,
        hubPlatform: $hubPlatform,
        hubRationale: $hubRationale,
        spokePlatforms: $spokePlatforms,
        distributionRules: $distributionRules,
        audiencePersonasJson: $audiencePersonasJson,
        sourceUrl: $sourceUrl,
        createdAt: datetime()
      })`,
      {
        id: personaId,
        companyName: persona.companyName || resolvedCompanyName,
        domain: persona.domain || "",
        voiceTone: persona.voice?.tone || "",
        voiceStyle: persona.voice?.style || "",
        voiceKeywords: persona.voice?.keywords || [],
        voiceAvoids: persona.voice?.avoids || [],
        hubPlatform: persona.hubPlatform || "linkedin",
        hubRationale: persona.hubRationale || "",
        spokePlatforms: persona.spokePlatforms || [],
        distributionRules: persona.distributionRules || [],
        audiencePersonasJson: JSON.stringify(persona.audiencePersonas || []),
        sourceUrl: url || "",
      }
    );

    return NextResponse.json({
      personaId,
      ...persona,
    });
  } catch (error) {
    console.error("Persona builder error:", error);
    return NextResponse.json({ error: "Failed to build company persona" }, { status: 500 });
  }
}
