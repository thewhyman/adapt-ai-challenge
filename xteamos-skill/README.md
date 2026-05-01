# xTeamOS — Local Plugin

Two Claude Code skills that turn any workspace into a company-specific campaign engine.
Give it a URL. Get 5 platform-native marketing assets + a full campaign plan.

---

## Architecture

```
xos-base skill         — Ingestion Engine + Extraction Engine + Persona Engine
     ↑ extended by
xteamos skill          — Campaign Engine + Distribution Rules + File Output
     ↓ HTTP (api_base)
API layer              — Next.js routes (runs anywhere — see deploy targets)
     ↓ bolt+tls
Neo4j Aura (SaaS)      — Graph DB, wired into API layer, invisible to skills

INCARNATION.md         — One file = one company = one xTeamOS instance
```

**No local server required.** Default `api_base` is `https://adapt-ai-challenge.vercel.app`.
Neo4j is SaaS Aura — skills never touch it directly.

### Deploy targets for the API layer

| Where | How | When |
|---|---|---|
| Vercel (default) | Already deployed — just use it | Now |
| Local dev | `npm run dev` in adapt-ai-challenge | Offline / custom build |
| Docker / k8s | Container the Next.js app + point to Aura or self-hosted Neo4j | Self-hosted |
| OpenClaw cluster | Skills install onto cluster nodes (Mitosis-style) | Future |

---

## Install

```bash
# Install both skills into Claude Code
bash install.sh

# Install skills + Gaia Dynamics workspace
bash install.sh --gaia

# Install skills + all incarnations
bash install.sh --all
```

That's it. No npm install, no server, no env vars needed locally.

---

## Run a Campaign

```bash
# Navigate to a workspace (e.g. Gaia incarnation)
cd ~/xteamos-workspaces/gaia-xteamos
claude
```

Then say:
```
run campaign for https://gaiadynamics.ai/tariff-engine
```

The skill:
1. Reads `INCARNATION.md` for company config + `api_base`
2. Calls `/api/ingest-url` — extracts content to Neo4j graph
3. Calls `/api/persona-builder` — learns company voice + audiences
4. Calls `/api/campaign` — generates 5 assets, runs Codex + Gemini swarm review
5. Writes 3 files to `./campaigns/`

---

## Output Files

| File | Contents |
|---|---|
| `{date}-{slug}-persona.md` | Brand voice, audience personas, hub platform, algorithm rules |
| `{date}-{slug}-campaign.md` | LinkedIn + X + Reddit + Instagram + Substack assets + campaign plan |
| `{date}-{slug}-swarm-review.md` | Codex platform rule check + Gemini quality scores |

---

## Pre-Built Gaia Demo Artifacts

Run `open incarnations/gaia-xteamos/campaigns/` to see the full input → output example:

```
INPUT-gaia-tariff-engine.md                  ← what the ingestion engine extracted
2026-04-21-gaia-tariff-engine-persona.md     ← company voice + audiences
2026-04-21-gaia-tariff-engine-campaign.md    ← full campaign (5 assets + plan)
2026-04-21-gaia-tariff-engine-swarm-review.md ← Codex + Gemini review (SHIP, 8.5/10)
```

---

## Add a New Incarnation

```bash
mkdir my-company-xteamos && cd my-company-xteamos
cat > INCARNATION.md << 'EOF'
---
company_name: My Company
company_url: https://mycompany.com
api_base: https://adapt-ai-challenge.vercel.app
output_dir: ./campaigns
---
EOF
mkdir campaigns
claude
# > run campaign for https://mycompany.com/product-launch
```

---

## Swarm Review

Every campaign is reviewed by two models in parallel:

- **Codex** — checks platform rules (LinkedIn links, Reddit voice, X thread structure, Instagram hashtag count). Auto-fixes blockers before returning.
- **Gemini** — scores 6 quality dimensions: hook, platform voice, angle differentiation, flywheel logic, first-hour protocol, audience fit.

Result is embedded in the campaign file and written as a separate `*-swarm-review.md`.

---

## Future: Mitosis-style Cluster Deployment

The long-term deployment target is a Kubernetes cluster running OpenClaw (or equivalent),
where skills are installed as cluster-level plugins and the API layer runs as pods.
Each incarnation = a namespace. Neo4j moves from Aura SaaS to a self-hosted cluster pod.
The skill's `api_base` just points to the cluster ingress — nothing else changes.
