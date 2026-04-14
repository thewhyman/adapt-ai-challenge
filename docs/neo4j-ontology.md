# Adapt AI — Neo4j Ontology & Graph Schema

**Date:** 2026-04-14 | **Status:** Implemented on Neo4j Aura

---

## Connection Details

- **Platform:** Neo4j Aura (managed SaaS, free tier)
- **URI:** `neo4j+s://f2738874.databases.neo4j.io`
- **Username:** `f2738874`
- **Password:** `DMwVN-VouhqU1LrfMEdcXbic7hM0szuoxnS067z9W6Y`
- **Database:** `f2738874`
- **MCP Server:** `neo4j-mcp` v1.5.0 (installed via `brew install neo4j-mcp`)
- **Driver:** `neo4j-driver` npm package for app code

---

## Ontology Design Decision

### Why Neo4j?

The ContentGraph data model (sections with `dependsOn[]`, concepts with `relatedConcepts[]`) is inherently a graph. Neo4j enables:
- Persisting extracted ontologies across sessions (not just in-memory client-side)
- Querying concept relationships for richer content maps
- Foundation for Phase 2 multi-doc knowledge base / RAG
- Graph-powered visualization in the UI

### Why 3-Ontology Stack?

We evaluated three approaches and chose a layered 3-ontology stack over schema.org alone or a custom-only schema:

| Ontology | Standard | What It Covers | Why Included |
|---|---|---|---|
| **Dublin Core** | ISO 15836 | Document metadata (title, creator, subject, format, date, language) | Industry standard for document metadata. Maps directly to our Document nodes. |
| **SKOS** | W3C Recommendation | Concept taxonomies (broader/narrower/related, concept schemes) | Purpose-built for knowledge organization. Our Concept nodes with `relatedConcepts` and `technicalDepth` map naturally to SKOS semantic relations. |
| **W3C ORG** | W3C Recommendation | Organizational structure (organizations, roles, memberships) | Models the audience side — who we're adapting content *for*. Roles map to audience profiles. |

**What we extend with custom types:** Adapt AI adds `AudienceProfile`, `OutputFormat`, `Adaptation`, and `Section` nodes plus adaptation-specific edges (`ADAPTED_FOR`, `USES_FORMAT`, `HAS_ADAPTATION`, `DEPENDS_ON`, `MENTIONS_CONCEPT`).

**What we rejected:**
- **Schema.org alone:** Too broad (800+ types, we'd use ~10). No concept-relationship modeling (SKOS does this better). No document-section hierarchy natively.
- **Custom-only schema:** Loses interoperability. If we ever export/integrate, standards compliance matters.
- **n10s RDF import:** Considered importing ontologies via neosemantics plugin, but Aura free tier may not support it. Instead, we modeled the ontology directly as Neo4j nodes/relationships using the naming conventions of each standard.

---

## Complete Graph Schema

### Node Types (9)

#### Dublin Core Layer

**Document**
```
Labels: [:Document]
Properties:
  id: STRING (unique constraint)
  title: STRING
  documentType: STRING  // "technical_doc" | "training_material" | "research" | "sop" | "general"
  dcFormat: STRING      // MIME type, e.g., "application/pdf"
  dcCreator: STRING
  dcDate: DATE_TIME
  dcDescription: STRING
  dcSubject: STRING
  dcLanguage: STRING    // e.g., "en"
  overallComplexity: INTEGER  // 1-5
  audienceAssumptions: LIST   // what expertise the original assumes
  rawContent: STRING          // full extracted text
  createdAt: DATE_TIME
  updatedAt: DATE_TIME
```

**Section**
```
Labels: [:Section]
Properties:
  id: STRING (unique constraint)
  title: STRING
  content: STRING
  complexity: INTEGER   // 1-5
  purpose: STRING       // "context" | "core_argument" | "evidence" | "action_item" | "reference"
  orderIndex: INTEGER   // position in document
```

#### SKOS Layer

**ConceptScheme**
```
Labels: [:ConceptScheme]
Properties:
  id: STRING (unique constraint)
  title: STRING
  description: STRING
  createdAt: DATE_TIME
```

**Concept**
```
Labels: [:Concept]
Properties:
  id: STRING (unique constraint)
  name: STRING           // skos:prefLabel
  definition: STRING     // skos:definition
  technicalDepth: INTEGER  // 1-5
  createdAt: DATE_TIME
```

#### W3C ORG Layer

**Organization**
```
Labels: [:Organization]
Properties:
  id: STRING (unique constraint)
  name: STRING
  description: STRING
```

**Role**
```
Labels: [:Role]
Properties:
  id: STRING (unique constraint)
  name: STRING
  orgLevel: STRING       // "C-suite / VP", "IC / Senior IC", "Various"
  decisionScope: STRING  // "strategic", "implementation", "adoption"
```

#### Adapt AI Custom Layer

**AudienceProfile**
```
Labels: [:AudienceProfile]
Properties:
  id: STRING (unique constraint)
  name: STRING                    // "Executive" | "Technical IC" | "Customer-Facing"
  technicalDepth: INTEGER         // 1-5
  lengthBudget: STRING            // "brief" | "moderate" | "detailed"
  focusAreas: LIST                // e.g., ["ROI", "risk", "timeline"]
  terminologyPreference: STRING   // "business" | "technical" | "accessible"
  decisionContext: STRING         // e.g., "Needs to approve budget"
```

**OutputFormat**
```
Labels: [:OutputFormat]
Properties:
  id: STRING (unique constraint)
  name: STRING            // "Executive Summary" | "One-Pager" | "Quick Reference"
  description: STRING
  maxWords: INTEGER       // 500, 800, 400
  structure: LIST         // ordered section names, e.g., ["Key Takeaway", "Context", "Recommendation", "Next Steps"]
```

**Adaptation**
```
Labels: [:Adaptation]
Properties:
  id: STRING (unique constraint)
  adaptedContent: STRING         // markdown output
  rationaleKept: LIST            // sections/concepts preserved and why
  rationaleCut: LIST             // what was removed and why
  rationaleSimplified: LIST      // what was simplified and how
  rationaleExpanded: LIST        // what was expanded for this audience
  terminologyChanges: LIST       // e.g., ["API endpoint → service interface"]
  createdAt: DATE_TIME
```

### Relationship Types (10)

```
Document -[HAS_SECTION]-> Section          // Document contains sections
Document -[HAS_ADAPTATION]-> Adaptation    // Document was adapted
Section -[DEPENDS_ON]-> Section            // Section depends on another section
Section -[MENTIONS_CONCEPT]-> Concept      // Section references a concept
Concept -[IN_SCHEME]-> ConceptScheme       // Concept belongs to a taxonomy
Concept -[SKOS_RELATED]-> Concept          // SKOS semantic relation between concepts
Role -[ROLE_IN]-> Organization             // Role exists within an org
AudienceProfile -[TARGETS_ROLE]-> Role     // Audience profile maps to an org role
Adaptation -[ADAPTED_FOR]-> AudienceProfile  // Adaptation targets an audience
Adaptation -[USES_FORMAT]-> OutputFormat      // Adaptation uses a specific format
```

### Visual Schema

```
                    ┌──────────────┐
                    │ Organization │
                    └──────┬───────┘
                           │ ROLE_IN
                    ┌──────▼───────┐
                    │    Role      │
                    └──────┬───────┘
                           │ TARGETS_ROLE
                    ┌──────▼───────────┐
                    │ AudienceProfile  │
                    └──────┬───────────┘
                           │ ADAPTED_FOR
┌──────────┐  HAS_    ┌───▼────────┐  USES_    ┌──────────────┐
│ Document │─────────▶│ Adaptation │─────────▶│ OutputFormat  │
└────┬─────┘ ADAPTATION└────────────┘  FORMAT   └──────────────┘
     │
     │ HAS_SECTION
     ▼
┌──────────┐  DEPENDS_ON  ┌──────────┐
│ Section  │─────────────▶│ Section  │
└────┬─────┘              └──────────┘
     │
     │ MENTIONS_CONCEPT
     ▼
┌──────────┐  SKOS_RELATED  ┌──────────┐
│ Concept  │───────────────▶│ Concept  │
└────┬─────┘                └──────────┘
     │
     │ IN_SCHEME
     ▼
┌───────────────┐
│ ConceptScheme │
└───────────────┘
```

---

## Seeded Data

### Audience Profiles (3)

| ID | Name | Tech Depth | Length | Focus | Terminology | Decision Context |
|---|---|---|---|---|---|---|
| `executive` | Executive | 1 | brief | ROI, risk, timeline, strategic impact | business | Needs to approve budget and resource allocation |
| `technical-ic` | Technical IC | 5 | detailed | implementation, architecture, dependencies, technical tradeoffs | technical | Needs to implement or review the technical approach |
| `customer-facing` | Customer-Facing | 2 | moderate | use case, benefits, getting started, support | accessible | Needs to understand value and how to use the product |

### Output Formats (3)

| ID | Name | Max Words | Structure |
|---|---|---|---|
| `executive-summary` | Executive Summary | 500 | Key Takeaway → Context → Recommendation → Next Steps |
| `one-pager` | One-Pager | 800 | Overview → Key Points → Details → Call to Action |
| `quick-reference` | Quick Reference | 400 | At a Glance → Key Facts → Quick Links → FAQ |

### W3C ORG Roles (3)

| ID | Name | Org Level | Decision Scope |
|---|---|---|---|
| `role-executive` | Executive Leadership | C-suite / VP | strategic |
| `role-technical-ic` | Technical Individual Contributor | IC / Senior IC | implementation |
| `role-customer-facing` | Customer-Facing Team | Various | adoption |

### SKOS ConceptScheme (1)

| ID | Title |
|---|---|
| `adapt-ai-concepts` | Adapt AI Content Concepts |

---

## Constraints (9)

```cypher
CREATE CONSTRAINT doc_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE
CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE
CREATE CONSTRAINT scheme_id IF NOT EXISTS FOR (s:ConceptScheme) REQUIRE s.id IS UNIQUE
CREATE CONSTRAINT org_id IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE
CREATE CONSTRAINT role_id IF NOT EXISTS FOR (r:Role) REQUIRE r.id IS UNIQUE
CREATE CONSTRAINT section_id IF NOT EXISTS FOR (s:Section) REQUIRE s.id IS UNIQUE
CREATE CONSTRAINT audience_id IF NOT EXISTS FOR (a:AudienceProfile) REQUIRE a.id IS UNIQUE
CREATE CONSTRAINT format_id IF NOT EXISTS FOR (f:OutputFormat) REQUIRE f.id IS UNIQUE
CREATE CONSTRAINT adaptation_id IF NOT EXISTS FOR (a:Adaptation) REQUIRE a.id IS UNIQUE
```

---

## Key Cypher Patterns for App Code

### Store extracted content graph
```cypher
// Create document
CREATE (d:Document {
  id: $docId, title: $title, documentType: $docType,
  dcFormat: $format, overallComplexity: $complexity,
  audienceAssumptions: $assumptions, rawContent: $content,
  createdAt: datetime(), updatedAt: datetime()
})

// Create sections and link to document
MATCH (d:Document {id: $docId})
UNWIND $sections AS sec
CREATE (s:Section {
  id: sec.id, title: sec.title, content: sec.content,
  complexity: sec.complexity, purpose: sec.purpose, orderIndex: sec.orderIndex
})
CREATE (d)-[:HAS_SECTION]->(s)

// Create concepts and link to scheme
MATCH (cs:ConceptScheme {id: 'adapt-ai-concepts'})
UNWIND $concepts AS con
MERGE (c:Concept {id: con.id})
SET c.name = con.name, c.definition = con.definition,
    c.technicalDepth = con.technicalDepth, c.createdAt = datetime()
CREATE (c)-[:IN_SCHEME]->(cs)

// Link sections to concepts
UNWIND $sectionConceptLinks AS link
MATCH (s:Section {id: link.sectionId})
MATCH (c:Concept {id: link.conceptId})
CREATE (s)-[:MENTIONS_CONCEPT]->(c)

// Link section dependencies
UNWIND $dependencies AS dep
MATCH (s1:Section {id: dep.from})
MATCH (s2:Section {id: dep.to})
CREATE (s1)-[:DEPENDS_ON]->(s2)

// Link concept relationships
UNWIND $conceptRelations AS rel
MATCH (c1:Concept {id: rel.from})
MATCH (c2:Concept {id: rel.to})
MERGE (c1)-[:SKOS_RELATED]->(c2)
```

### Store adaptation result
```cypher
MATCH (d:Document {id: $docId})
MATCH (a:AudienceProfile {id: $audienceId})
MATCH (f:OutputFormat {id: $formatId})
CREATE (ad:Adaptation {
  id: $adaptationId,
  adaptedContent: $content,
  rationaleKept: $kept,
  rationaleCut: $cut,
  rationaleSimplified: $simplified,
  rationaleExpanded: $expanded,
  terminologyChanges: $termChanges,
  createdAt: datetime()
})
CREATE (d)-[:HAS_ADAPTATION]->(ad)
CREATE (ad)-[:ADAPTED_FOR]->(a)
CREATE (ad)-[:USES_FORMAT]->(f)
```

### Query document with full graph
```cypher
MATCH (d:Document {id: $docId})-[:HAS_SECTION]->(s:Section)
OPTIONAL MATCH (s)-[:MENTIONS_CONCEPT]->(c:Concept)
OPTIONAL MATCH (s)-[:DEPENDS_ON]->(dep:Section)
RETURN d, collect(DISTINCT s) AS sections,
       collect(DISTINCT c) AS concepts,
       collect(DISTINCT dep) AS dependencies
```

### Query audience profile with role context
```cypher
MATCH (a:AudienceProfile {id: $audienceId})-[:TARGETS_ROLE]->(r:Role)-[:ROLE_IN]->(org:Organization)
RETURN a, r, org
```

### Query all adaptations for a document
```cypher
MATCH (d:Document {id: $docId})-[:HAS_ADAPTATION]->(ad:Adaptation)
MATCH (ad)-[:ADAPTED_FOR]->(a:AudienceProfile)
MATCH (ad)-[:USES_FORMAT]->(f:OutputFormat)
RETURN ad, a.name AS audience, f.name AS format
ORDER BY ad.createdAt DESC
```

---

## MCP Server Configuration

File: `.mcp.json` at project root (gitignored)

```json
{
  "mcpServers": {
    "neo4j-mcp": {
      "type": "stdio",
      "command": "neo4j-mcp",
      "args": [],
      "env": {
        "NEO4J_URI": "neo4j+s://f2738874.databases.neo4j.io",
        "NEO4J_USERNAME": "f2738874",
        "NEO4J_PASSWORD": "DMwVN-VouhqU1LrfMEdcXbic7hM0szuoxnS067z9W6Y",
        "NEO4J_DATABASE": "f2738874",
        "NEO4J_READ_ONLY": "false"
      }
    }
  }
}
```

Install: `brew install neo4j-mcp`

MCP tools available: `get-schema`, `read-cypher`, `write-cypher`

---

## Integration with Adapt AI App

The app's two-pass LLM pipeline integrates with Neo4j as follows:

1. **Upload & Parse** → Extract raw text from PDF/DOCX
2. **Pass 1 (Extract)** → LLM extracts ContentGraph JSON → **Write to Neo4j** (Document, Sections, Concepts, relationships)
3. **Pass 2 (Adapt)** → **Read from Neo4j** (ContentGraph + AudienceProfile + OutputFormat) → LLM generates adaptation → **Write Adaptation to Neo4j**
4. **UI** → **Read from Neo4j** for content map visualization, adaptation history, concept graph

API changes from original TDD:
- `POST /api/extract` now returns `{ documentId }` instead of full ContentGraph (graph is in Neo4j)
- `POST /api/adapt` now takes `{ documentId, audienceId, formatId }` instead of passing ContentGraph from client
