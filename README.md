# Adapt AI: Enterprise Content Adaptation Platform

[![Live Demo](https://img.shields.io/badge/Live-adapt--ai--challenge.vercel.app-indigo?style=flat-square)](https://adapt-ai-challenge.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph_DB-4581c3?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4.6-7562f1?style=flat-square)](https://www.anthropic.com/)
[![GPT](https://img.shields.io/badge/GPT--4o--mini-Judge-00a67e?style=flat-square)](https://openai.com/)

**Submitted for the AI Fund Visiting Engineer Builder Challenge.**

---

## The Problem

Organizations produce high-value knowledge (strategy docs, technical specs, research, SOPs) but its impact is bottlenecked — a 20-page technical spec is opaque to Sales; a marketing brief lacks rigor for Engineering. Today, adaptation is manual, inconsistent, and slow.

## The Solution

Adapt AI transforms any document into targeted intelligence for any audience. Upload once, adapt for everyone — powered by ontology extraction and Co-Dialectic persona-driven synthesis.

**[Try the Live Demo →](https://adapt-ai-challenge.vercel.app/)**

---

## Evaluation Criteria Mapping

| Criteria | What We Built | Where to Look |
|---|---|---|
| **Product Judgment** | 4 industry-specific demos (Landing AI, Gaia Dynamics, Healthcare, Palantir) with 3 contextual personas each. Grounded generation flags gaps instead of hallucinating — the #1 differentiator. | [Live Demo](https://adapt-ai-challenge.vercel.app/) → click any demo card |
| **Architecture** | Two-pass pipeline: Claude Haiku extracts ontology → Neo4j graph → Claude Sonnet adapts through caliber-enforced personas → GPT-4o-mini validates. Graph-RAG, not summarization. | [TDD](docs/TDD.md) |
| **AI Sophistication** | Multi-model pipeline (Claude + GPT as independent judge), 1-shot prompting for JSON reliability, persona fusion at 0.001% caliber, gap detection over hallucination. | See [Architecture](#architecture) below |
| **Execution Speed** | 48-hour sprint. Patent filed concurrently. 40+ commits. Full-stack: Next.js 16, Neo4j Aura, Vercel Pro, two LLM providers. | [Git history](https://github.com/thewhyman/adapt-ai-challenge/commits/main) |

---

## Architecture

```
Upload PDF/DOCX
    ↓
Pass 1: Claude Haiku extracts ontology → Neo4j knowledge graph
    ↓
Select Co-Dialectic persona + output format
    ↓
Pass 2: Claude Sonnet adapts from graph (caliber-enforced, 0.001%)
    ↓
Pass 3: GPT-4o-mini judges for hallucinations + missed gaps
    ↓
Results: Adapted Content | Rationale | Terminology | Gaps to Fill
         with reliability score + word count + generation time
```

**Why this architecture?**

- **Graph-RAG over summarization.** LLMs lose structure when summarizing. The Neo4j ontology preserves concept relationships, section dependencies, and abstraction hierarchies — then the adaptation traverses the graph at the right depth for each persona.
- **Multi-model validation.** Claude generates. GPT judges. Different architectures have different blind spots — the judge catches what the generator misses. This is the core thesis.
- **Grounded generation.** When a persona expects information the source doesn't contain (ROI in a tech doc, testimonials in a spec), the system flags the gap in red. Never fabricates.
- **Caliber-enforced personas.** The prompt doesn't say "adapt for executives." It says "You ARE Steve Jobs + Jony Ive at 0.001% caliber." The full competency stack is exercised unprompted.

---

## What Ships Today vs. What's Next

### Phase 1 — Shipped (48-hour MVP)
- Two-pass ontology extraction + persona adaptation
- Neo4j graph persistence with 3-ontology stack (Dublin Core + SKOS + W3C ORG)
- 3 Co-Dialectic persona fusions (Visionary Executive, Critical Builder, Growth Marketer)
- Grounded generation with gap flagging
- Adaptation rationale (kept / simplified / expanded / cut / terminology changes)

### Phase 2 — Shipped (Post-MVP, same sprint)
- Multi-model hallucination judge (GPT-4o-mini validates Claude)
- Reliability scoring per adaptation
- 4 industry demos with 12 domain-specific personas (including real AI Fund team)
- 1-shot prompting for JSON reliability
- SSE-attempted → client-side progress with step visualization
- Neo4j adaptation caching

### Phase 3 — Next (with more time)
- **Streaming adaptation** — Claude SDK `messages.stream()` for word-by-word output. Eliminates wait-then-reveal UX.
- **Sonnet for extraction** — better structured JSON, fewer parse failures. Trade-off: +10s latency (acceptable with streaming).
- **Async hallucination judge** — return content immediately, update reliability score when judge completes.
- **Multi-document ontology** — shared Concept nodes across documents create a knowledge web.
- **Enterprise RBAC** — audience profiles mapped to Azure AD / Okta roles.

### Phase 4 — Vision
- **Co-Dialectic Chrome Extension** — local LLM as prompt quality gate before any cloud model. Reduces inference costs for providers.
- **Federated knowledge** — ontology patterns shared across deployments without exposing source content.
- **Multi-tenant enterprise platform** — team-wide persona libraries, shared ontologies, usage analytics.

---

## Key Decisions & Trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Claude Haiku for extraction | Speed (~10s vs ~25s for Sonnet) | Occasionally produces malformed JSON — mitigated with 1-shot prompting + fallback parser |
| Claude Sonnet for adaptation | Quality of persona channeling | Slower (~15-25s) — mitigated with progress visualization |
| GPT-4o-mini as judge (not Claude) | Different model = different blind spots | Adds ~5-10s — skipped when time-constrained (>45s elapsed) |
| Neo4j over vector DB | Ontology requires structural relationships, not similarity search | More complex setup — mitigated with Aura free tier |
| Vercel Pro ($20/mo) | 60s function timeout (free tier = 10s) | Minimal cost for demo reliability |
| Cached demos | Instant evaluator experience | Not "live" — but real pipeline works for uploads |

## Lessons Learned (48 hours)

1. **Vercel serverless buffers SSE.** Server-Sent Events don't stream in real-time on Vercel — they batch. Client-side progress with realistic timing is the pragmatic answer.
2. **pdf-parse v2 fails on serverless.** v1.1.1 works. Native dependencies don't survive the serverless bundling.
3. **1-shot prompting is essential for JSON output.** Claude occasionally wraps JSON in markdown fences or adds explanatory text. A concrete example in the prompt eliminates 90%+ of parse failures.
4. **The judge is the differentiator.** Without multi-model validation, this is "another Claude wrapper." With it, it's a grounded generation system that proves its own reliability.
5. **Personas are audiences.** The same mechanism that adapts content for a "Visionary Executive" adapts it for "Andrew Ng, CEO of Landing AI." Custom personas for specific humans is the unlock.

---

## Deliverables

1. **[Live Prototype](https://adapt-ai-challenge.vercel.app/)** — 4 demos + real upload
2. **[PRD](docs/PRD.md)** — User, pain, wedge, scope, sequencing
3. **[TDD](docs/TDD.md)** — Architecture, models, trade-offs, phases
4. **[Showcase](docs/SHOWCASE.md)** — Side-by-side walkthrough

---

## Local Setup

```bash
# Prerequisites: Node.js 18+, Neo4j Aura account, Anthropic + OpenAI API keys
cp .env.example .env.local  # Add your keys
npm install
npm run dev                  # http://localhost:3000
```

---

## The Broader Vision

V1 is one module of a substantially larger system. I would welcome the opportunity to walk through the complete vision under NDA.

---

*Built by [Anand Vallamsetla](https://thewhyman.com) for the AI Fund Visiting Engineer Program.*
*deploy 2026-04-15 03:30 PDT*
