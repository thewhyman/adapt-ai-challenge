# Product Requirements Document (PRD): Adapt AI

**Venture Idea:** Adapt AI
**Challenge:** AI Fund Visiting Engineer (48-hour Builder Challenge)
**Author:** Anand Vallamsetla

---

## 1. Executive Summary
Adapt AI solves the "last-mile delivery" problem of enterprise knowledge. Organizations generate massive amounts of high-value content (strategy docs, technical specs, research), but its impact is bottlenecked because it's locked in a single framing. A 20-page technical spec is opaque to Sales; a marketing brief lacks the rigor needed by Engineering. 

Adapt AI is an **enterprise content adaptation layer**. It takes a single source-of-truth document, extracts its underlying ontology (concepts, sections, arguments), and dynamically regenerates it through the lens of **hyper-specific, multi-dimensional audiences** using the **Co-Dialectic Persona Engine**.

---

## 2. The Unfair Advantages (Why This Wins)

We are not building a ChatGPT "summarize this for me" wrapper. Two core architectural choices form our enterprise moat:

### A. The Neo4j Ontology Moat (Palantir/Glean Model)
LLMs are stateless text generators. They hallucinate structure. **Adapt AI extracts the document into a strict graphical ontology in Neo4j.** 
* LLM extracts `Concepts`, `Sections`, and `Mentions`.
* Neo4j stores this as a queryable Graph DB.
* **Why it matters:** Just like Palantir and Glean, the real enterprise value isn't the chatbot—it's the structured ontology that maps the organization's brain. Adapt AI persists knowledge structure independently of the model.

### B. The Co-Dialectic Persona Engine
Generic roles ("Executive", "IC") produce generic, useless text. Adapt AI utilizes **Persona Fusion** (e.g., Steve Jobs + Jony Ive for Vision & UX; Linus Torvalds + Shreyas Doshi for Architecture & Pragmatism). 
* True insight requires crossing problem spaces.
* By adapting content using fused, high-caliber expert lenses, Adapt AI surfaces the most critical blind spots and value propositions for the target audience.

---

## 3. Product Features & MVP Scope

### 3.1. MVP Scope (48-hr Challenge)
The 48-hour MVP hyper-focuses on the core wedge: **Ontology Extraction + Co-Dialectic Adaptation**.

✅ **Feature 1: Graph-Based Extraction**
* Users upload a PDF (up to 20 pages).
* The LLM pipeline extracts sections and core concepts.
* Results are persisted iteratively into a Neo4j Graph.

✅ **Feature 2: Co-Dialectic Adaptation**
* Users select a pre-configured fused persona (e.g., "The Visionary Builder", "The Critical Engineer").
* The engine passes the Neo4j ontology map to Claude 3.5 Sonnet to rewrite the context entirely through that lens.

✅ **Feature 3: Adaptation Rationale**
* The UI explicitly shows *why* changes were made (what was kept, what was simplified or expanded, and terminology translations) to build absolute trust.

### 3.2. Out of Scope for MVP (Conscious Omissions)
* **Auth & Workspaces:** Unnecessary for evaluating the core LLM reasoning loop.
* **Multi-doc RAG:** Premature optimization. We must prove single-document structural parsing first before adding retrieval complexity.

---

## 4. User Experience (Founder Mode UI)

The interface is modeled after top-tier AI applications (Vercel, Anthropic). It relies on premium typography (Inter), glassmorphism, and a strict dark/light high-contrast aesthetic to reduce cognitive load. 
* **State 1:** Clean upload dropzone.
* **State 2:** Visual breakdown of extracted sections & concepts.
* **State 3:** Split-view results showing the adapted text alongside the AI's transparent reasoning.

---

## 5. Success Metrics
* **Extraction Quality:** Concepts extracted graph cleanly onto the original document text without hallucinated nodes.
* **Adaptation Delta:** Word count/complexity demonstrably changes by >30% between "The Critical Engineer" view and "The Visionary Builder" view.
* **Execution Velocity:** Completing a stable, full-stack Neo4j graph application in <48 hours proves intense engineering momentum.
