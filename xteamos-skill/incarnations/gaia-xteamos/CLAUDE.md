# Gaia xTeamOS

This workspace is the **Gaia Dynamics incarnation** of xTeamOS.

The `xteamos` skill is installed at `~/.claude/skills/xteamos/SKILL.md`.
The `xos-base` kernel is installed at `~/.claude/skills/xos-base/SKILL.md`.

When the user asks for a campaign, run the full xTeamOS pipeline using the
incarnation context below.

## Deployment

The xTeamOS API runs at: **https://adapt-ai-challenge.vercel.app**

No local server needed. The API connects to Neo4j Aura (SaaS graph DB)
automatically. This skill just calls the API.

Future deployments: the same API can run on a local k8s cluster, a VM, or
an OpenClaw node — the skill config only needs `api_base` updated in `INCARNATION.md`.

## Incarnation Context

```
company_name:  Gaia Dynamics
company_url:   https://gaiadynamics.ai
api_base:      https://adapt-ai-challenge.vercel.app
output_dir:    ./campaigns
domain:        Trade compliance AI / Supply chain risk
backed_by:     Andrew Ng's AI Fund
```

## About Gaia Dynamics

Gaia Dynamics builds AI-powered tariff compliance tools for US importers.
Their flagship product is the **Tariff Audit Engine** — it analyzes HS codes,
maps tariff exposure under current US trade policy, and surfaces duty
optimization opportunities automatically.

**Pain:** US tariff policy changes faster than compliance teams can track.
A tariff change can add 25%+ cost to an import overnight. Most companies
find out when they get the bill.

**Differentiator:** Real-time monitoring + AI audit in one tool, not a
quarterly consultant engagement.

## Pre-loaded Persona

If the user is in a hurry, use this directly (skip the Persona Engine API call):

```
PERSONA RESULT
Company: Gaia Dynamics
Domain: Trade compliance / supply chain AI

VOICE:
Tone: authoritative, data-driven, direct
Style: practitioner thought leadership
Vocabulary: tariff exposure, HS code, duty optimization, compliance audit, trade policy
Avoid: revolutionary, game-changing, AI-powered (overused), seamless, robust

HUB: LinkedIn
Rationale: VP Supply Chain, Customs Brokers, and CFOs all live on LinkedIn.
           B2B compliance — no consumer audience.

SPOKES (ordered): Substack → X/Twitter → Reddit (r/supplychain) → Instagram

AUDIENCE PERSONAS:
1. VP Supply Chain / Head of Trade Compliance (LinkedIn)
   Owns the tariff problem. Gets blamed when costs spike.
   Pain: "I need to know about a tariff change before it hits our P&L."

2. Customs Broker / Trade Consultant (LinkedIn + Reddit)
   Clients ask about tariff changes constantly.
   Pain: "I can't scale answering the same tariff questions."

3. CFO / Finance Leader (LinkedIn)
   Tariff costs hit P&L unexpectedly. Wants forecasting, not surprises.
   Pain: "I can't budget when trade policy changes every week."
```

## Usage

```
run campaign for https://gaiadynamics.ai/tariff-engine
```

or simply:

```
xteamos run https://gaiadynamics.ai
```

Output files are written to `./campaigns/`.
