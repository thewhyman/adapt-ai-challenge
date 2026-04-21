/**
 * swarm-review.ts — server-side parallel swarm quality gate
 *
 * Runs codex (structural/technical) + gemini (marketing/domain) simultaneously.
 * Returns structured review with scores, blockers, and a final recommendation.
 *
 * Only runs server-side (Node.js). Safe no-op in browser/edge contexts.
 * Uses process.env keys sourced from ~/cyborg/.env via Next.js env loading.
 */

export interface SwarmIssue {
  severity: "BLOCKER" | "WARNING" | "SUGGESTION";
  platform?: string;
  location?: string;
  issue: string;
  fix?: string;
}

export interface SwarmDimension {
  dimension?: string;
  section?: string;
  score: number;
  feedback?: string;
  note?: string;
}

export interface SwarmReviewResult {
  codex: {
    issues: SwarmIssue[];
    blockerCount: number;
    raw: string;
  };
  gemini: {
    dimensions: SwarmDimension[];
    overallScore: number;
    recommendation: "SHIP" | "REVISE" | "HOLD";
    raw: string;
  };
  passed: boolean;
  recommendation: "SHIP" | "REVISE" | "HOLD";
  durationMs: number;
}

// ── Prompts ─────────────────────────────────────────────────────────────────

function codexCampaignPrompt(campaignJson: string): string {
  return `You are a brutal senior engineer and platform-policy expert reviewing a marketing campaign JSON.
Check for violations and issues:
1. LinkedIn body contains external links (BLOCKER — LinkedIn suppresses reach)
2. Reddit post contains marketing language like "revolutionary", "game-changing", "powerful" (BLOCKER)
3. Instagram hashtag count outside 15-20 range (WARNING)
4. LinkedIn hashtag count above 3 (WARNING)
5. Twitter thread has links in tweet bodies not replies (BLOCKER)
6. Missing or empty platform assets (BLOCKER)
7. Publishing schedule has multiple hub posts on same day (WARNING)
8. Claims in content that seem hallucinated/unsupported (WARNING)

Return ONLY a JSON array. No markdown, no prose:
[{"severity":"BLOCKER|WARNING|SUGGESTION","platform":"linkedin|twitter|reddit|instagram|substack|general","issue":"description","fix":"how to fix"}]

Campaign JSON:
${campaignJson.slice(0, 6000)}`;
}

function geminiCampaignPrompt(campaignJson: string): string {
  return `You are an elite content strategist and growth expert evaluating a campaign plan.
Score each dimension 1-10. Flag anything below 7.

Dimensions to score:
- hook_quality: Does the LinkedIn hook force a "see more" click within 3 lines?
- platform_voice: Does Reddit sound like an engineer log, not marketing?
- angle_differentiation: Are the 3 key angles genuinely distinct and non-obvious?
- flywheel_logic: Does the hub→spoke→hub loop make strategic sense?
- first_hour_protocol: Is the first-hour plan specific and executable?
- audience_fit: Does each asset speak to the right persona's actual pain?

Return ONLY valid JSON. No markdown fences:
{
  "dimensions": [{"dimension":"string","score":1-10,"note":"string"}],
  "overall_score": 1-10,
  "ship_recommendation": "SHIP|REVISE|HOLD",
  "top_revision": "string (single most important improvement if not SHIPping)"
}

Campaign JSON:
${campaignJson.slice(0, 6000)}`;
}

// ── Runner ───────────────────────────────────────────────────────────────────

async function runCodex(prompt: string): Promise<string> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const exec = promisify(execFile);

  try {
    // codex exec reads prompt from arg
    const { stdout } = await exec("codex", ["exec", prompt], {
      timeout: 45_000,
      env: {
        ...process.env,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
      },
    });
    return stdout;
  } catch (err: any) {
    return err?.stdout || err?.message || "codex review failed";
  }
}

async function runGemini(prompt: string): Promise<string> {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const exec = promisify(execFile);

  try {
    const { stdout } = await exec("gemini", ["-p", prompt], {
      timeout: 45_000,
      env: {
        ...process.env,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
      },
    });
    return stdout;
  } catch (err: any) {
    return err?.stdout || err?.message || "gemini review failed";
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  // Strip markdown fences
  let s = raw.trim().replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  // Find first array or object
  for (const start of ["[", "{"]) {
    const idx = s.indexOf(start);
    if (idx >= 0) {
      try {
        return JSON.parse(s.slice(idx)) as T;
      } catch {
        // continue
      }
    }
  }
  return fallback;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function swarmReviewCampaign(
  campaignJson: string
): Promise<SwarmReviewResult> {
  const start = Date.now();

  // Run both reviewers in parallel
  const [codexRaw, geminiRaw] = await Promise.all([
    runCodex(codexCampaignPrompt(campaignJson)),
    runGemini(geminiCampaignPrompt(campaignJson)),
  ]);

  // Parse codex issues array
  const codexIssues = parseJson<SwarmIssue[]>(codexRaw, []);
  const blockerCount = codexIssues.filter(
    (i) => i.severity === "BLOCKER"
  ).length;

  // Parse gemini structured response
  const geminiParsed = parseJson<{
    dimensions?: SwarmDimension[];
    overall_score?: number;
    ship_recommendation?: string;
    top_revision?: string;
  }>(geminiRaw, {});

  const dimensions = geminiParsed.dimensions || [];
  const overallScore = geminiParsed.overall_score || 7;
  const geminiRec = (geminiParsed.ship_recommendation || "SHIP") as
    | "SHIP"
    | "REVISE"
    | "HOLD";

  // Final recommendation: HOLD if blockers, REVISE if gemini says so, else SHIP
  const recommendation: "SHIP" | "REVISE" | "HOLD" =
    blockerCount > 0 ? "HOLD" : geminiRec;

  return {
    codex: {
      issues: Array.isArray(codexIssues) ? codexIssues : [],
      blockerCount,
      raw: codexRaw.slice(0, 1000),
    },
    gemini: {
      dimensions,
      overallScore,
      recommendation: geminiRec,
      raw: geminiRaw.slice(0, 1000),
    },
    passed: blockerCount === 0 && geminiRec !== "HOLD",
    recommendation,
    durationMs: Date.now() - start,
  };
}
