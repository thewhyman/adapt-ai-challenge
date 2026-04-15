# Adapt AI: Enterprise Content Adaptation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph_DB-4581c3?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![Anthropic](https://img.shields.io/badge/Claude-Reasoning-7562f1?style=flat-square)](https://www.anthropic.com/)

**Adapt AI** transforms dense enterprise documents into targeted intelligence for any audience — powered by ontology extraction and Co-Dialectic persona-driven synthesis.

Submitted for the **AI Fund Visiting Engineer Builder Challenge**.

---

## Live Demo

**[https://adapt-ai-challenge.vercel.app/](https://adapt-ai-challenge.vercel.app/)**

Click **"1-Click Evaluator Demo"** for an instant walkthrough using the Palantir Apollo architecture brief.

---

## What Makes This Different

### 1. Graph-RAG Ontology Core (Not Summarization)
Most AI adaptation tools summarize — they compress text and lose structure. Adapt AI **extracts the document's ontology into a Neo4j knowledge graph** (sections as nodes, concepts as edges, dependencies as relationships), then adapts from the graph — not from raw text. Structure is preserved, not approximated.

### 2. Co-Dialectic Persona Engine (Not Generic Roles)
"Simplify for executives" produces generic text. Adapt AI uses **persona fusion at 0.001% caliber**:
- **The Visionary Executive** (Steve Jobs + Jony Ive) — strips jargon, tells the human story, focuses on why it matters
- **The Critical Builder** (Linus Torvalds + Shreyas Doshi) — demands architecture, trade-offs, failure modes, what could break
- **The Growth Marketer** (Gary Vee + Seth Godin) — platform-native content, hooks, distribution strategy, campaign arcs

Each persona produces radically different output from the same source — because they think differently, not just write differently.

### 3. Grounded Generation (Zero Hallucination)
When a persona expects information the source document doesn't contain (ROI metrics in a technical doc, customer testimonials in a spec), Adapt AI **flags the gap** instead of fabricating data:

> **[GAP: This persona would expect cost-of-failure metrics here, but the source document does not contain them. Ask the author to provide: average cost of a failed deployment in target environments.]**

Every other AI tool hallucinates to fill gaps. Adapt AI tells you exactly what's missing so you can fill it with real data. The **Gaps to Fill** tab (amber) surfaces all gaps in one view.

---

## Architecture

```
Upload PDF/DOCX
    ↓
Pass 1: Claude Haiku extracts ontology → Neo4j graph
    ↓
Select Co-Dialectic persona + output format
    ↓
Pass 2: Claude Sonnet adapts from graph (not raw text)
    ↓
Tabbed results: Adapted Content | Rationale | Terminology | Gaps to Fill
```

- **Two-pass LLM pipeline** — extraction (Haiku for speed) → adaptation (Sonnet for depth)
- **Neo4j-backed content graph** — Dublin Core + SKOS + W3C ORG ontology stack
- **Caliber-enforced prompts** — "You ARE this persona at 0.001%" not "adapt for this audience"
- **Grounded generation** — gaps flagged, never fabricated

---

## Deliverables

1. **[Live Prototype](https://adapt-ai-challenge.vercel.app/)** — Full end-to-end demo with instant cached examples
2. **[PRD](docs/PRD.md)** — Product requirements, wedge strategy, Co-Dialectic persona engine
3. **[TDD](docs/TDD.md)** — Graph-RAG architecture, model selection, trade-offs
4. **[Showcase](docs/SHOWCASE.md)** — Side-by-side walkthrough with Palantir Apollo as source

---

## Local Setup

### Prerequisites
- Node.js 18+
- Neo4j instance (AuraDB or local)
- Anthropic API Key

### Environment
```bash
cp .env.example .env.local
# Edit with your keys:
# ANTHROPIC_API_KEY=your_key
# NEO4J_URI=neo4j+s://your-instance
# NEO4J_USERNAME=your_user
# NEO4J_PASSWORD=your_password
```

### Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## The Broader Vision

The ontology extraction engine in V1 is one module of a substantially larger system — a self-evolving multi-agent architecture with a tiered federated intelligence network. A provisional patent has been filed on the full architecture concurrent with this submission.

---

*Built by [Anand Vallamsetla](https://thewhyman.com) for the AI Fund Visiting Engineer Program.*
