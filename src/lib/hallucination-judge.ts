import OpenAI from "openai";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
}

interface JudgeResult {
  reliability: number;
  hallucinations: string[];
  missedGaps: string[];
  verified: boolean;
}

export async function judgeAdaptation(
  sourceContent: string,
  adaptedContent: string,
  personaName: string
): Promise<JudgeResult> {
  try {
    const response = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a hallucination detection judge. You compare an adapted document against its source to verify factual accuracy. You are a DIFFERENT model architecture than the one that produced the adaptation — your independent perspective catches blind spots the generator missed.

Your job:
1. Check every factual claim in the adapted content against the source. Flag fabricated facts/numbers as HALLUCINATIONS.
2. Check for MISSED GAPS: information the target persona would expect that is NEITHER in the source NOR flagged as a gap in the adaptation. These are blind spots the generator missed.
3. Assign a reliability score 0-100 (deduct for hallucinations and missed gaps).

Respond with valid JSON:
{
  "reliability": number (0-100),
  "hallucinations": ["string — each fabricated claim not supported by source"],
  "missedGaps": ["string — info this persona would expect that is missing from both source and adapted output, and was NOT flagged as a gap"],
  "verified": boolean (true if reliability >= 85)
}`
        },
        {
          role: "user",
          content: `SOURCE DOCUMENT:\n${sourceContent.substring(0, 8000)}\n\nADAPTED VERSION (for ${personaName}):\n${adaptedContent}\n\nJudge the adaptation against the source. Return JSON only.`
        }
      ]
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { reliability: 0, hallucinations: ["Judge returned no valid JSON"], verified: false };

    const result = JSON.parse(jsonMatch[0]);
    return {
      reliability: Math.min(100, Math.max(0, result.reliability || 0)),
      hallucinations: result.hallucinations || [],
      missedGaps: result.missedGaps || [],
      verified: result.verified ?? (result.reliability >= 85)
    };
  } catch (error) {
    console.error("Hallucination judge error:", error);
    return { reliability: 0, hallucinations: ["Judge unavailable"], missedGaps: [], verified: false };
  }
}
