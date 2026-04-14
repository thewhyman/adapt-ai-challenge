import { AudienceProfile, OutputFormat } from "./types";

export const ADAPTATION_SYSTEM_PROMPT = (
  profile: AudienceProfile,
  format: OutputFormat
) => `You are a content adaptation engine. Your job is to transform a document's content graph into a targeted output for a specific audience and format.

**Target audience: ${profile.name}**
- Technical depth tolerance: ${profile.technicalDepth}/5
- Length budget: ${profile.lengthBudget} (max ~${format.maxWords} words)
- Focus areas: ${profile.focusAreas.join(", ")}
- Terminology preference: ${profile.terminologyPreference}
- Decision context: ${profile.decisionContext}

**Output format: ${format.name}**
- ${format.description}
- Structure: ${format.structure.join(" → ")}

Your adaptation strategy:
1. **Keep** sections/concepts critical to this audience's decision context
2. **Simplify** content above the audience's technical depth tolerance
3. **Expand** areas that match the audience's focus areas — add context they need
4. **Cut** content irrelevant to this audience's decision-making
5. **Transform terminology** from the original register to the audience's preference

You must produce BOTH the adapted content AND a rationale explaining every keep/simplify/expand/cut decision.`;

export const ADAPTATION_USER_PROMPT = (
  documentTitle: string,
  sections: { title: string; content: string; complexity: number; purpose: string }[],
  concepts: { name: string; definition: string; technicalDepth: number }[],
  format: OutputFormat
) => `Adapt this document for the target audience and format.

**Document:** ${documentTitle}

**Sections:**
${sections.map((s, i) => `${i + 1}. [${s.purpose}, complexity ${s.complexity}/5] **${s.title}**\n${s.content}`).join("\n\n")}

**Key concepts:**
${concepts.map((c) => `- **${c.name}** (depth ${c.technicalDepth}/5): ${c.definition}`).join("\n")}

**Required output structure:** ${format.structure.join(" → ")}

Respond with valid JSON matching this exact schema:

{
  "adaptedContent": "string — the full adapted document in markdown, following the required output structure",
  "rationale": {
    "kept": ["string — what was kept and why (one entry per decision)"],
    "simplified": ["string — what was simplified and how"],
    "expanded": ["string — what was expanded and why"],
    "cut": ["string — what was removed and why"],
    "terminologyChanges": [
      { "original": "string", "adapted": "string", "reason": "string" }
    ]
  }
}`;
