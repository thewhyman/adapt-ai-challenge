#!/usr/bin/env bash
# swarm-review.sh — parallel multi-model quality gate
# Usage:
#   ./scripts/swarm-review.sh campaign <campaign-json-file>
#   ./scripts/swarm-review.sh code <source-file-or-dir>
#   ./scripts/swarm-review.sh content <markdown-file>
#
# Runs codex (brutal critique) + gemini (domain expert) in parallel.
# Exits 0 if both pass, 1 if either flags blockers.
# Output: structured JSON to stdout, human summary to stderr.
#
# Env: sources ~/cyborg/.env for API keys.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../.swarm-logs"
mkdir -p "$LOG_DIR"

[[ -f "$HOME/cyborg/.env" ]] && set -a && source "$HOME/cyborg/.env" && set +a

kind="${1:-}"
target="${2:-}"

if [[ -z "$kind" || -z "$target" ]]; then
  echo "Usage: swarm-review.sh <campaign|code|content> <file>" >&2
  exit 1
fi

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
run_id="$(date +%s)"
codex_out="$LOG_DIR/codex-$run_id.txt"
gemini_out="$LOG_DIR/gemini-$run_id.txt"
codex_exit=0
gemini_exit=0

# ─── Prompts per review kind ──────────────────────────────────────────────────

case "$kind" in
  campaign)
    CODEX_PROMPT="You are a brutal senior engineer reviewing a campaign strategy JSON.
Check for:
1. Platform rule violations (external links in LinkedIn body, marketing language in Reddit, thread structure for X)
2. Missing fields or empty platform assets
3. Publishing schedule that violates platform timing rules
4. Hashtag count out of range (Instagram needs 15-20, LinkedIn max 3)
5. Any hallucinated claims that sound invented rather than sourced from the document
Rate each issue: BLOCKER | WARNING | SUGGESTION
Output format: JSON array of {severity, platform, issue, fix}"

    GEMINI_PROMPT="You are an elite content strategist reviewing a campaign plan.
Evaluate:
1. Hook quality — does the LinkedIn hook force a 'see more' click?
2. Platform-native voice — does Reddit post sound like an engineer, not a marketer?
3. Angle strength — are the 3 key angles genuinely differentiated?
4. Flywheel logic — does the hub→spoke→hub loop make sense?
5. First-hour protocol — is it specific and executable?
Score each section 1-10. Flag anything below 7 as needing revision.
Output format: JSON with {section, score, feedback} array + overall_score + ship_recommendation (SHIP|REVISE|HOLD)"
    ;;

  code)
    CODEX_PROMPT="You are a senior TypeScript/Next.js engineer doing a security and correctness review.
Check for:
1. Unvalidated external inputs (prompt injection vectors, missing size limits, no timeout on fetch calls)
2. Error paths that leak internals (raw stack traces in API responses)
3. Neo4j query injection risks
4. Missing rate limiting or abuse vectors
5. TypeScript type safety violations or unsafe casts
6. Any fire-and-forget writes that could silently fail and corrupt state
Rate each: BLOCKER | WARNING | SUGGESTION
Output: JSON array of {severity, file, line_hint, issue, fix}"

    GEMINI_PROMPT="You are a product engineer reviewing API design for a demo product.
Check for:
1. API contract clarity — are error messages useful to the frontend?
2. Response shape consistency across /ingest-url, /persona-builder, /campaign
3. Loading state signals — does the API give enough info for progressive UI?
4. Demo reliability — what would cause this to fail live in a demo?
5. Cold start or latency risks on Vercel serverless
Output: JSON with {issue, severity, recommendation} array + demo_risk_level (LOW|MEDIUM|HIGH)"
    ;;

  content)
    CODEX_PROMPT="You are a technical editor with a zero-tolerance policy for vague claims.
Review this content for:
1. Unsupported claims (stats without sources, superlatives without proof)
2. Logical gaps (conclusion doesn't follow from evidence)
3. Jargon used incorrectly or imprecisely
4. Platform rule violations if this is social content
Output: JSON array of {severity, location, issue, suggested_fix}"

    GEMINI_PROMPT="You are a senior brand strategist and content director.
Review for:
1. Audience fit — does the content speak to the right person's pain?
2. Differentiation — could a competitor say exactly the same thing?
3. Hook strength — would this stop a scroll?
4. CTA clarity — is the next action obvious?
5. Voice consistency — does it sound like one human, not a committee?
Score 1-10 per dimension. Output: JSON with {dimension, score, note} array + overall_verdict (SHIP|REVISE|HOLD)"
    ;;

  *)
    echo "[swarm-review] Unknown kind: $kind (use: campaign|code|content)" >&2
    exit 1
    ;;
esac

# ─── Read target file ─────────────────────────────────────────────────────────

if [[ ! -f "$target" && ! -d "$target" ]]; then
  echo "[swarm-review] Target not found: $target" >&2
  exit 1
fi

content="$(cat "$target" 2>/dev/null || find "$target" -type f \( -name "*.ts" -o -name "*.tsx" \) | head -5 | xargs cat 2>/dev/null)"

# Truncate to ~8K chars to stay fast and cheap
content="${content:0:8000}"

# ─── Parallel dispatch ────────────────────────────────────────────────────────

echo "[swarm-review] Running $kind review on: $target" >&2
echo "[swarm-review] Dispatching codex + gemini in parallel..." >&2

# Codex: brutal technical/structural review
(
  echo "$CODEX_PROMPT

--- ARTIFACT ---
$content" | codex exec - 2>/dev/null > "$codex_out"
) &
CODEX_PID=$!

# Gemini: domain expert / marketing / product review
(
  echo "$GEMINI_PROMPT

--- ARTIFACT ---
$content" | GOOGLE_API_KEY="$GOOGLE_API_KEY" gemini -p "$(cat -)" 2>/dev/null > "$gemini_out"
) &
GEMINI_PID=$!

# Wait for both
wait $CODEX_PID || codex_exit=$?
wait $GEMINI_PID || gemini_exit=$?

echo "[swarm-review] Both agents complete." >&2

# ─── Parse results ────────────────────────────────────────────────────────────

codex_result="$(cat "$codex_out" 2>/dev/null || echo '[]')"
gemini_result="$(cat "$gemini_out" 2>/dev/null || echo '{}')"

# Count blockers from codex output (look for BLOCKER keyword)
blocker_count=$(echo "$codex_result" | grep -c "BLOCKER" 2>/dev/null || echo 0)

# Check gemini ship recommendation
ship_rec=$(echo "$gemini_result" | grep -oE '"ship_recommendation"\s*:\s*"[A-Z]+"' | grep -oE '[A-Z]+$' || echo "SHIP")
overall_verdict=$(echo "$gemini_result" | grep -oE '"overall_verdict"\s*:\s*"[A-Z]+"' | grep -oE '[A-Z]+$' || echo "SHIP")

# Log to JSONL
printf '{"ts":"%s","kind":"%s","target":"%s","codex_exit":%d,"gemini_exit":%d,"blockers":%d,"ship_rec":"%s"}\n' \
  "$ts" "$kind" "$target" "$codex_exit" "$gemini_exit" "$blocker_count" "${ship_rec:-${overall_verdict:-SHIP}}" \
  >> "$LOG_DIR/swarm-review.jsonl"

# ─── Structured output ────────────────────────────────────────────────────────

python3 - <<PYEOF
import json, sys

codex_raw = """$codex_result"""
gemini_raw = """$gemini_result"""

def try_parse(s):
    # Try to find first JSON array or object
    for start in ['[', '{']:
        idx = s.find(start)
        if idx >= 0:
            try:
                return json.loads(s[idx:])
            except:
                pass
    return s.strip()[:500]  # Return truncated text if not JSON

output = {
    "run_id": "$run_id",
    "kind": "$kind",
    "target": "$target",
    "codex": try_parse(codex_raw),
    "gemini": try_parse(gemini_raw),
    "blocker_count": int("$blocker_count"),
    "recommendation": "${ship_rec:-${overall_verdict:-SHIP}}",
    "pass": $blocker_count == 0
}

print(json.dumps(output, indent=2))
PYEOF

# Exit with error if blockers found
if [[ $blocker_count -gt 0 ]]; then
  echo "[swarm-review] $blocker_count BLOCKER(s) found. Fix before shipping." >&2
  exit 1
fi

echo "[swarm-review] Clean. Recommendation: ${ship_rec:-${overall_verdict:-SHIP}}" >&2
exit 0
