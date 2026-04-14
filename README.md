# Adapt AI: Enterprise Content Adaptation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph_DB-4581c3?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![Anthropic](https://img.shields.io/badge/Claude-Reasoning-7562f1?style=flat-square)](https://www.anthropic.com/)

**Adapt AI** is an intelligent content adaptation layer designed for the modern enterprise. It solves the critical bottleneck of "knowledge entropy" by transforming static documents, transcripts, and decks into dynamic, audience-aware assets.

This project is submitted as part of the **AI Fund Visiting Engineer Builder Challenge**.

---

## 🚀 Evaluator Fast-Track

Before diving into the codebase, see the architecture in action:

1.  **[✨ The Frictionless Epiphany (Showcase)](docs/SHOWCASE.md)**
    *   *A frictionless Markdown artifact proving complex text transformation across 3 distinct personas instantly.*

---

## 📦 Deliverables

As per the challenge requirements, all core deliverables are accessible below:

1.  **[Functional Prototype](https://adapt-ai-challenge.vercel.app/)**
    *   *A live, end-to-end demonstration of multi-modal content transformation.*
2.  **[Product Requirements Document (PRD)](docs/PRD.md)**
    *   *The strategic wedge, MVP scoping, and market positioning rationale.*
3.  **[Technical Design Document (TDD)](docs/TDD.md)**
    *   *Deep dive into the Graph-RAG architecture and model selection.*

---

## 💡 Core Value Proposition

Organizations struggle to make high-value knowledge (SOPs, research, training) usable across different contexts. Adapt AI intelligently automates:

-   **Audience-Aware Transformation:** Seamlessly shift from technical technical documentation to executive summaries.
-   **Multi-Format Repurposing:** Convert recorded sessions into searchable reference material or slide decks into one-pagers.
-   **Content Structure Understanding:** Beyond simple summarization, the system identifies the underlying ontology of the content using a Graph Database.

---

## 🏗️ Technical Architecture

Adapt AI is built on a high-throughput, AI-native stack:

-   **Frontend:** Next.js 15 with Tailwind CSS 4 for a premium, responsive experience.
-   **Reasoning Engine:** Anthropic Claude 3.5 Sonnet handles document extraction and complex reasoning.
-   **Knowledge Hub:** Neo4j stores document ontologies, allowing for multi-hop relationship retrieval (Graph-RAG).
-   **Parsing:** Advanced processing for PDF and DOCX formats utilizing `pdf-parse` and `mammoth`.

---

## 🛠️ Local Setup & Installation

To run the Adapt AI prototype locally, follow these steps:

### 1. Prerequisites
- Node.js 18+
- A Neo4j instance (AuraDB or local)
- Anthropic API Key

### 2. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
# AI Model
ANTHROPIC_API_KEY=your_key_here

# Graph Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

### 3. Installation
```bash
npm install
```

### 4. Development Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Original Problem Statement
The full challenge description can be found in [docs/problem-statement.md](docs/problem-statement.md).

---

*Submitted for consideration to the **AI Fund** Visiting Engineer Program.*
