# Adapt AI

Enterprise content adaptation tool. Upload a document, extract its structure, adapt it for different audiences.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Claude Sonnet 4.6 via Anthropic SDK
- Neo4j Aura (graph database for content graph persistence)
- Vercel deployment

## Architecture
- Two-pass LLM pipeline: structure extraction → audience-aware adaptation
- Neo4j-backed content graph (3-ontology stack: Dublin Core + SKOS + W3C ORG)
- No auth; Neo4j Aura is the persistence layer
- Server-side document parsing (pdf-parse, mammoth.js)

## Key docs
- `docs/PRD.md` — product requirements
- `docs/TDD.md` — technical design document
- `docs/neo4j-ontology.md` — graph schema, seeded data, Cypher patterns (source of truth for Neo4j)
