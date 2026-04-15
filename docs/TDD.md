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

## 4. Implemented Post-MVP (During Sprint)

### 4a. Grounded Generation (Zero Hallucination)
When a persona expects information the source doesn't contain, the system flags the gap instead of fabricating data. Gaps appear in a red "Gaps to Fill" tab with specific instructions for the author. This is enforced at the prompt level — the LLM is instructed to NEVER invent facts and to use `[GAP: ...]` markers.

### 4b. Multi-Model Hallucination Judge
After Claude generates an adaptation, OpenAI GPT-4o-mini independently validates it against the source document. The judge checks for:
- **Fabricated claims** — facts/numbers not in the source
- **Missed gaps** — information the persona would expect that neither the source contains NOR the adaptation flagged
- **Reliability score** (0-100%) — displayed to the user

This is the key architectural insight: different model architectures have different blind spots. A judge from a different model family catches what the generator's own self-review would miss.

### 4c. Caliber-Enforced Persona Prompts
The adaptation prompt doesn't say "adapt for executives." It says "You ARE Steve Jobs + Jony Ive at 0.001% caliber." The persona exercises its full competency stack unprompted — the output must be something the real person would approve without corrections.

### 4d. Custom Persona Support
Personas can be real individuals (e.g., "Andrew Ng, CEO of Landing AI") — not just archetypes. The system auto-detects which personas are relevant per document context. Demonstrated in the Landing AI demo with Andrew Ng, Eli Chen, and Mike Rubino as personas.

---

## 5. Scale & Future Expansion (Phased Roadmap)

### Phase 1 (Shipped — 48hr MVP)
- Two-pass ontology extraction + adaptation pipeline
- Neo4j graph persistence
- 3 Co-Dialectic persona fusions
- Grounded generation with gap flagging

### Phase 2 (Shipped — Post-MVP)
- Multi-model hallucination judge (OpenAI validates Claude)
- Reliability scoring per adaptation
- 6 personas including real AI Fund team members
- 4 cached demo documents across AI Fund portfolio verticals

### Phase 3 (Roadmap)
- **Multi-Doc Ontology:** Cross-document knowledge graphs via shared Concept nodes
- **Streaming:** SSE for real-time adaptation output
- **Enterprise RBAC:** Audience profiles mapped to Azure AD / Okta roles
- **Co-Dialectic Chrome Extension:** Local LLM as prompt gate before any cloud model (inverted Advisor pattern)
- **Federated Knowledge:** Ontology patterns shared across deployments without exposing source content (connects to the broader Agency OS architecture)
