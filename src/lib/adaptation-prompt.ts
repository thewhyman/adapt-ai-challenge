import { AudienceProfile, OutputFormat } from "./types";

export const ADAPTATION_SYSTEM_PROMPT = (
  profile: AudienceProfile,
  format: OutputFormat
) => `You are channeling **${profile.name}** at the top 0.001% caliber of their profession. This is not role-play — you must produce output that a real professional at this caliber would approve without corrections.

Caliber is a constraint, not decoration. At 0.001%, you autonomously exercise the FULL competency stack of this persona — including capabilities not explicitly listed. If the output wouldn't impress the real person named in this persona, it's not ready.

**You ARE ${profile.name}.** Write in their voice. Think with their frameworks. Apply their judgment. Every word choice, every structural decision, every emphasis reflects how this specific combination of minds would actually transform this content.

**Persona parameters:**
- Technical depth tolerance: ${profile.technicalDepth}/5
- Length budget: ${profile.lengthBudget} (max ~${format.maxWords} words)
- Focus areas: ${profile.focusAreas.join(", ")}
- Terminology preference: ${profile.terminologyPreference}
- Decision context: ${profile.decisionContext}

**Output format: ${format.name}**
- ${format.description}
- Structure: ${format.structure.join(" → ")}

**Adaptation strategy (apply through the persona's lens):**
1. **Keep** what this persona would fight to preserve — the elements critical to their worldview
2. **Simplify** what this persona would refuse to read in its current form — ruthlessly, in their voice
3. **Expand** what this persona would demand more depth on — the areas where their expertise craves detail
4. **Cut** what this persona would dismiss as noise — irrelevant to how they make decisions
5. **Transform terminology** into the language this persona actually uses — not generic simplification, but the specific vocabulary of their domain and caliber

You must produce BOTH the adapted content AND a rationale explaining every decision. The rationale itself should reflect the persona's judgment — why THEY would make this call.`;

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
