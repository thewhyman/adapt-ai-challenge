# Adapt AI — PRD
**Author:** Anand Vallamsetla | **Date:** 2026-04-13 | **Status:** MVP Build Guide

---

## Who is the user and what is their pain point

**Primary user:** Content operations leads, product managers, and L&D teams at mid-to-large enterprises (500+ employees).

**The pain:** Organizations produce high-value knowledge content — technical documentation, training materials, SOPs, research briefs — but it only works for the audience it was written for. A 40-page technical architecture doc is useless to the VP who needs a 1-page investment case. A training manual written for engineers doesn't help the sales team explain the product. A recorded onboarding session is unsearchable.

Today, repurposing is manual: a senior engineer spends 3 hours distilling a design doc into an executive summary, a product marketer rewrites a technical spec into a customer-facing one-pager, an L&D specialist reformats a procedure into a quick-reference card. This is **slow** (hours per adaptation), **inconsistent** (each person adapts differently), and **expensive** (done by the most senior people, who should be doing higher-judgment work).

**Quantified pain:** Enterprise content teams spend ~30% of their time reformatting and repurposing existing content (Kapost/Content Marketing Institute data). For a 10-person content team at $120K avg, that's $360K/year spent on mechanical transformation.

## What is your wedge into this market

**Wedge:** Single-document, audience-aware adaptation. Take one input document and produce structurally-adapted outputs for different audiences — not summarization, but intelligent transformation that understands *what each audience needs to know and how they need to consume it.*

**Why this wedge:**
1. **Highest-frequency pain.** Every department does this daily. It's the content equivalent of "translating between languages" — except the languages are audiences (technical ↔ executive ↔ customer ↔ training).
2. **Demonstrably beyond summarization.** The market has plenty of "summarize this doc" tools. Adapt AI's structural understanding + audience-aware restructuring is a defensible technical moat.
3. **Zero integration required.** Upload a file, get adapted outputs. No knowledge base setup, no API integration, no change management. This is the fastest path to "aha" moment.
4. **Expands naturally.** Single-doc adaptation → multi-doc knowledge base → continuous adaptation pipeline → enterprise content layer.

**Founder-market fit:** I built and shipped a cross-platform content adaptation system (Co-Dialectic campaign) that transforms a single piece of content into LinkedIn, Reddit, Twitter, Substack, and Instagram-native formats — each with platform-specific tone, structure, and audience targeting. 1,761 impressions across platforms in the first campaign. Adapt AI is this concept applied to enterprise knowledge content.

## What is in the MVP and what you explicitly cut

### In the MVP (this build)

| Feature | Why |
|---|---|
| **PDF and DOCX upload** | Two most common enterprise content formats |
| **Content structure extraction** | The core differentiator — LLM extracts sections, key concepts, complexity level, audience assumptions. Visualized as a content map. |
| **3 audience profiles: Executive, Technical IC, Customer-Facing** | Covers the three highest-frequency adaptation paths in enterprise |
| **3 output formats: Executive Summary, One-Pager, Quick Reference** | Most common deliverable types requested from content adaptation |
| **3-ontology content modeling** | Content graph uses a standards-based 3-ontology stack: Dublin Core (document metadata), SKOS (concept taxonomies and relationships), W3C ORG (organizational roles and audience targeting). Standards compliance enables future interoperability and export. |
| **Neo4j-backed content graph** | Extracted structure is persisted in Neo4j Aura as 9 node types and 10 relationship types (Document→Section→Concept→ConceptScheme, Adaptation→AudienceProfile→Role→Organization). Graph relationships make concept dependencies and cross-section relationships queryable — the foundation for multi-document awareness in Phase 2. See [neo4j-ontology.md](docs/neo4j-ontology.md) for full schema. |
| **Side-by-side adaptation view** | Shows original structure alongside adapted output — makes the intelligence visible |
| **Adaptation rationale** | Brief explanation of what was kept/cut/simplified/expanded and why — builds trust in AI output |
| **Deployed URL** | Vercel deployment, accessible to evaluators |

### Explicitly cut (Phase 2+)

| Cut | Why deferred |
|---|---|
| Video/audio/transcript input | Multi-modal adds complexity without proving core value prop. Phase 2 after document adaptation is validated. |
| RAG over knowledge base | Single-doc adaptation proves the AI; multi-doc RAG is a retrieval problem. Neo4j graph is the foundation — RAG queries traverse it in Phase 2. |
| Custom audience profiles | 3 pre-built profiles demonstrate the concept. Custom profiles are a configuration feature, not a proof of intelligence. |
| Batch processing | Single-doc flow proves E2E. Batch is a scale feature. |
| Team collaboration / sharing | Not relevant to proving core value. Phase 3. |
| Slide deck input/output | Adds format complexity. PDFs of slide decks work as input for MVP. |

## Why you sequenced the build the way you did

**Sequence:** Graph schema + ontology seeding → Structure extraction → Adaptation engine → UI → Polish → Deploy

**Rationale:**
1. **Graph schema and seed data come first.** Neo4j schema (9 node types, 10 relationship types, 9 uniqueness constraints) must exist before extraction can persist. Seed AudienceProfiles, OutputFormats, Roles, Organization, and the initial ConceptScheme.
2. **Structure extraction is the riskiest component.** If the LLM can't reliably extract document structure, classify concepts into the SKOS ConceptScheme, and persist the content graph to Neo4j, the whole product fails. Build and validate this second.
3. **Adaptation engine is the core value.** Once the content graph is in Neo4j, the adaptation pipeline (graph traversal + audience profile → adaptation plan → generated output) is where product judgment lives. Graph relationships enable richer adaptation — e.g., traversing `DEPENDS_ON` and `MENTIONS_CONCEPT` edges to decide what context an executive needs.
4. **UI makes it real.** The side-by-side view with adaptation rationale is what transforms a "tech demo" into a "product." Build it after the engine works.
5. **Polish is earned.** Only polish what's working. Ship fast, refine the rough edges.

This sequence front-loads data model risk (will the graph schema support the queries the adaptation engine needs?) and technical risk (can the LLM reliably extract into graph structure?) before presentation risk — the right order for a 48-hour build where "judgment and speed, not polish" is the evaluation criteria.
