# Technical Design Document (TDD): Adapt AI

**Venture Idea:** Adapt AI
**Challenge:** AI Fund Visiting Engineer
**Author:** Anand Vallamsetla

---

## 1. System Architecture: The Two-Pass Ontology Pipeline

Adapt AI separates "understanding" from "generation." Passing a raw 20-page PDF directly into a standard LLM context window to "rewrite it" leads to detail loss, hallucination, and flattened nuance. 

Instead, Adapt AI utilizes a **Two-Pass Pipeline backed by a Neo4j Graph Database**.

### Step 1: Structural Extraction (Pass 1)
- **Input:** Raw Document (PDF/Text)
- **Process:** Claude 3.5 Sonnet is instructed to read the document and extract a JSON array of `Sections` and `Concepts`.
- **Persistence:** These entities are projected into Neo4j via Cypher queries:
  `Document -> HAS_SECTION -> Section -> MENTIONS_CONCEPT -> Concept`
- **Moat:** This creates an enterprise knowledge graph (analogous to Palantir/Glean ontology extraction), making the document queryable programmatically.

### Step 2: Co-Dialectic Adaptation (Pass 2)
- **Input:** Neo4j Graph Ontology + Fused Audience Profile + Document Text
- **Process:** The exact document graph and raw text are injected into a highly conditioned Claude 3.5 Sonnet prompt, steered by the **Co-Dialectic Persona Engine**.
- **Output:** A rewritten document and an explicit `rationale` trace validating the adaptations.

---

## 2. Tech Stack & Justification 

| Component | Technology | Rationale (Why this stack?) |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Highest velocity for full-stack React. Built-in API routes eliminate the need for a separate Node/Python backend, optimizing the 48-hour budget. |
| **LLM Engine** | Anthropic Claude 3.5 Sonnet | Claude dramatically outperforms GPT-4o on rigorous JSON schema adherence and large-context structural reasoning required for the Extraction pass. |
| **Database** | Neo4j Aura (Managed Cloud Graph) | Relational DBs are horrific for ontologies. Vector DBs (Chroma/Pinecone) destroy structural hierarchy. A Graph DB natively models `[Section]->[Concept]` relationship, essential for precise enterprise RAG. |
| **Styling** | Tailwind CSS | Utility-first generation allows for the creation of a premium, "Vercel-tier" interface without writing custom CSS files. |
| **Deployment** | Vercel | Seamless Next.js CI/CD, enabling instant edge-deployment of the prototype. |

---

## 3. Data Model (Neo4j Graph Schema)

### Node Labels
* `Document` (id, title, content, type)
* `Section` (id, heading, orderIndex)
* `Concept` (id, name, definition)
* `AudienceProfile` (id, name, technicalDepth, decisionContext) - Contains Co-Dialectic instructions.
* `Adaptation` (id, adaptedContent, rationale metrics)

### Key Relationships
* `(Document)-[:HAS_SECTION]->(Section)`
* `(Section)-[:MENTIONS_CONCEPT]->(Concept)`
* `(Adaptation)-[:ADAPTED_FOR]->(AudienceProfile)`
* `(Document)-[:HAS_ADAPTATION]->(Adaptation)`

---

## 4. Scale & Future Expansion

While excluded from the 48-hour MVP, the graph architecture elegantly supports:
1. **Multi-Doc Ontology:** When multiple documents mention the same `Concept` node, Neo4j immediately creates a knowledge web, enabling cross-document adaptation natively.
2. **Streaming:** Implementing Server-Sent Events (SSE) or React Server Components for the LLM output to reduce perceived latency.
3. **Enterprise RBAC:** Audience profiles can map directly to Azure AD / Okta roles for automated content security trimming.
