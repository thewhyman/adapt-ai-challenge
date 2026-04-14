# Adapt AI — Technical Design Document
**Author:** Anand Vallamsetla | **Date:** 2026-04-13 | **Status:** MVP Architecture

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js App (Vercel)                      │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────────┐   │
│  │  Upload   │──▶│  Parser  │──▶│  Structure Extractor   │   │
│  │  (UI)     │   │ (pdf/docx│   │  (Claude API)          │   │
│  └──────────┘   └──────────┘   │  + Ontology context     │   │
│        │                        └───────────┬────────────┘   │
│        │                                    │                │
│  ┌─────▼─────┐                    ┌─────────▼──────────┐     │
│  │ Ontology   │                    │   Neo4j Aura       │     │
│  │ Selector   │───context────────▶│   (Content Graph)  │     │
│  │ (UI)       │                    │                    │     │
│  └───────────┘                    │  Document           │     │
│                                   │   ├─HAS_SECTION→    │     │
│  ┌──────────┐   ┌──────────────┐  │   Section           │     │
│  │  Output   │◀──│  Adaptation  │◀│   ├─MENTIONS→       │     │
│  │  View     │   │  Generator   │ │   Concept           │     │
│  │  (UI)     │   │  (Claude API)│ │   ├─IN_SCHEME→      │     │
│  └──────────┘   └──────────────┘  │   ConceptScheme     │     │
│        │                ▲         └────────────────────┘     │
│        │         ┌──────┴──────┐                             │
│        │         │  Audience   │                             │
│        │         │  Profile    │                             │
│        ▼         └─────────────┘                             │
│  ┌──────────┐                                                │
│  │ Rationale│  "What changed and why"                        │
│  │ Panel    │                                                │
│  └──────────┘                                                │
└──────────────────────────────────────────────────────────────┘
```

## Architecture Decisions and Trade-offs

### A. Next.js 14 + Vercel (over Python backend)

**Decision:** Full-stack Next.js with API Routes instead of FastAPI + separate frontend.

**Why:** Single deployment target (Vercel), zero CORS config, server-side API key management, and fastest path to a deployed URL. Trade-off: less flexibility for heavy ML pipelines, but MVP needs only LLM API calls — no custom model serving.

### B. Claude API via Anthropic SDK (over OpenAI, open-source)

**Decision:** Claude Sonnet 4.6 as the primary LLM for both structure extraction and adaptation generation.

**Why:** Best-in-class at structured output, long-context document processing (200K tokens handles any enterprise doc), and nuanced instruction following. Sonnet balances speed and quality — Opus would be better for structure extraction but too slow for interactive UX. Trade-off: single-vendor dependency. Mitigation: LLM calls are behind an abstraction layer; swapping models requires changing one file.

### C. Two-pass LLM pipeline (over single-prompt)

**Decision:** Separate structure extraction and adaptation generation into two LLM calls instead of one.

**Why:** This is the core architectural bet. A single prompt ("summarize this for executives") produces summarization, not adaptation. The two-pass approach enables:
1. **Pass 1 — Structure Extraction:** Extract sections, key concepts, concept relationships, complexity per section, and audience assumptions into a structured JSON content graph. This is reusable across all audience/format combinations.
2. **Pass 2 — Audience-Aware Adaptation:** Content graph + audience profile → adaptation plan → generated output. The adaptation plan explicitly reasons about what to keep/cut/expand/simplify before generating.

Trade-off: 2x API calls per adaptation. Mitigation: Pass 1 is cached — extract once, adapt many times. This also enables the "adaptation rationale" feature (showing what changed and why) for free, since the adaptation plan is an intermediate artifact.

### D. Neo4j Aura as content graph store (over in-memory JSON)

**Decision:** Persist the content graph in Neo4j Aura instead of passing it as JSON between client and server.

**Why:** The content graph is inherently a graph — sections depend on sections, concepts relate to concepts, concepts belong to ontology schemes. A graph database makes these relationships first-class and queryable. Specific benefits:
1. **Richer adaptation.** The adaptation pass can traverse `DEPENDS_ON` and `MENTIONS_CONCEPT` edges to reason about which context an audience needs — not just which sections to include.
2. **SKOS ontology support.** Concepts are classified into `ConceptScheme` nodes via `IN_SCHEME` edges. This makes the content graph domain-aware (a "pipeline" in software engineering vs healthcare means different things).
3. **Phase 2 foundation.** Multi-document RAG becomes graph traversal — documents share concepts through the same `ConceptScheme`, enabling cross-document awareness without a separate vector store.
4. **Dublin Core metadata.** Documents carry standardized metadata (`dcCreator`, `dcDate`, `dcFormat`, `dcLanguage`, `dcSubject`) enabling future search and filtering.

Trade-off: adds a database dependency to an otherwise stateless app. Mitigation: Neo4j Aura is a managed service (zero ops), and the app degrades gracefully — extraction and adaptation still work if Neo4j is unreachable, they just don't persist.

### E. 3-ontology stack (over schema.org or custom-only)

**Decision:** Layer three W3C/ISO standards — Dublin Core (document metadata), SKOS (concept taxonomies), W3C ORG (organizational roles) — plus Adapt AI custom types, rather than using schema.org or a fully custom schema.

**Why:** Each standard covers one domain cleanly:
1. **Dublin Core (ISO 15836)** for document metadata — `dcCreator`, `dcDate`, `dcFormat`, `dcLanguage`, `dcSubject` on Document nodes. Industry standard; maps directly to our Document model.
2. **SKOS (W3C)** for concept organization — `ConceptScheme` and `Concept` nodes with `IN_SCHEME`, `SKOS_RELATED` edges. Purpose-built for knowledge organization. Our concept relationships and `technicalDepth` map naturally to SKOS semantic relations.
3. **W3C ORG** for the audience side — `Organization` and `Role` nodes model who we're adapting content *for*. `AudienceProfile` targets a `Role` via `TARGETS_ROLE`.

**What we rejected:**
- **Schema.org alone:** Too broad (800+ types, we'd use ~10). No concept-relationship modeling (SKOS does this better).
- **Custom-only:** Loses interoperability. Standards compliance enables future export/integration.
- **n10s RDF import:** Aura free tier may not support the neosemantics plugin. Instead, modeled ontologies directly as Neo4j nodes using each standard's naming conventions.

See [neo4j-ontology.md](docs/neo4j-ontology.md) for the complete schema, seeded data, and Cypher patterns.

### F. Pre-built audience profiles (over freeform)

**Decision:** Three hardcoded audience profiles (Executive, Technical IC, Customer-Facing) with structured parameters instead of free-text audience descriptions.

**Why:** Structured profiles produce consistent, high-quality adaptations. Each profile defines: technical depth tolerance (1-5), terminology preferences, length budget, focus areas (ROI vs implementation vs use case), and decision-making context. Free-text descriptions would require the LLM to infer all of this, producing inconsistent results. Trade-off: less flexible. Acceptable for MVP; custom profiles are Phase 2.

### E. Client-side file parsing (over server-side)

**Decision:** Parse PDF and DOCX in the browser using pdf-parse (via WASM) and mammoth.js.

**Why:** Eliminates file upload to server for parsing, reduces latency, and keeps sensitive documents client-side until the user explicitly triggers adaptation (which requires API calls). Trade-off: limited format support (no OCR, no scanned PDFs). Acceptable for MVP — enterprise docs are almost always digital-native.

**Update:** If WASM PDF parsing is unreliable, fall back to server-side parsing in API routes. The abstraction supports both.

## Data Models

### Neo4j Graph Schema

The content graph is persisted in Neo4j Aura. Full schema (9 node types, 10 relationship types), seeded data, uniqueness constraints, and Cypher query patterns are documented in [neo4j-ontology.md](docs/neo4j-ontology.md).

**Summary:**

| Layer | Nodes | Standard |
|-------|-------|----------|
| Dublin Core | Document, Section | ISO 15836 |
| SKOS | Concept, ConceptScheme | W3C |
| W3C ORG | Organization, Role | W3C |
| Adapt AI | AudienceProfile, OutputFormat, Adaptation | Custom |

**Key relationships:**
```
Document ─HAS_SECTION→ Section ─MENTIONS_CONCEPT→ Concept ─IN_SCHEME→ ConceptScheme
Section ─DEPENDS_ON→ Section          Concept ─SKOS_RELATED→ Concept
Document ─HAS_ADAPTATION→ Adaptation ─ADAPTED_FOR→ AudienceProfile ─TARGETS_ROLE→ Role ─ROLE_IN→ Organization
Adaptation ─USES_FORMAT→ OutputFormat
```

## API Design

### POST /api/extract
- **Input:** `{ content: string, fileName: string, fileType: "pdf" | "docx" }`
- **Output:** `{ documentId: string }` — ID of the persisted Document node
- **LLM:** Claude Sonnet 4.6, structured output mode
- **Side effect:** Creates Document, Section, and Concept nodes in Neo4j. Links Concepts to the "Adapt AI Content Concepts" ConceptScheme via `IN_SCHEME`. Creates `DEPENDS_ON` edges between sections and `SKOS_RELATED` edges between concepts.

### GET /api/document/:id
- **Output:** Full content graph — Document with sections, concepts, concept schemes, and relationships
- **Source:** Neo4j traversal from Document node

### POST /api/adapt
- **Input:** `{ documentId: string, audienceId: string, formatId: string }`
- **Output:** `{ adaptationId: string, adaptedContent: string, rationale: object }`
- **LLM:** Claude Sonnet 4.6, structured output mode
- **Side effect:** Creates Adaptation node in Neo4j, linked to Document via `HAS_ADAPTATION`, AudienceProfile via `ADAPTED_FOR`, and OutputFormat via `USES_FORMAT`.

### Key design choice: Neo4j-backed, no auth
No auth, no session management. Neo4j Aura is the persistence layer — the content graph is stored as nodes and relationships, not passed as JSON between calls. This enables graph traversal during adaptation (richer output) and sets the foundation for multi-document awareness in Phase 2. Trade-off vs fully stateless: adds a managed database dependency. Acceptable because Neo4j Aura is zero-ops and the extraction→adaptation pipeline benefits from queryable relationships.

## AI/ML Model Selection and Agent Design

**Model:** Claude Sonnet 4.6 (`claude-sonnet-4-6`)

**Why Sonnet over Opus:** Adaptation is latency-sensitive (user is waiting). Sonnet produces 95% of Opus quality for structured extraction tasks at 5x the speed. For a prototype where the user uploads a doc and expects results in <30 seconds, Sonnet is the right trade-off.

**Why Claude over GPT-4o:** Stronger structured output reliability, better instruction following for complex multi-step prompts, and 200K context handles full enterprise documents without chunking.

**Agent design:** Not a multi-agent system. Two focused, well-prompted LLM calls with structured output schemas, backed by Neo4j for graph persistence between passes. Multi-agent orchestration adds latency and failure modes without adding value at MVP scale. The two-pass pipeline achieves the same separation of concerns through prompt design.

**Prompt engineering approach:**
- Pass 1 (extraction): Few-shot with 2 example document→content graph pairs
- Pass 2 (adaptation): System prompt defines audience profile parameters; user prompt provides content graph + format requirements; structured output schema enforces rationale generation

## What I Would Change With More Time

1. **RAG over the knowledge graph.** The Neo4j content graph already links concepts across documents via `IN_SCHEME` and `SKOS_RELATED`. Phase 2 adds graph traversal to the adaptation pass — e.g., "this concept was already explained in Document X (linked via shared ConceptScheme), so the adapted training material can reference it instead of re-explaining."
2. **Multi-modal input.** Video transcription (Whisper) → content graph, slide deck parsing (extracting visuals + speaker notes), audio recording → searchable reference. Each new input type is a new acquisition channel.
3. **Custom audience profiles with learning.** Let users define their own audience profiles, then learn from their edits to the adapted output — each correction improves future adaptations. This is the Co-Dialectic feedback loop applied to enterprise content.
4. **Streaming output.** Adaptation generation should stream to the UI for perceived performance. Current MVP waits for full response.
5. **Content diff visualization.** Richer side-by-side view showing exactly which original sections mapped to which adapted sections, with color-coded transformation types (kept/simplified/expanded/cut).
6. **Evaluation framework.** Automated quality scoring for adaptations: factual consistency with source, appropriate detail level for audience, format adherence. This would enable systematic prompt optimization (P14 Self-Evolution).
