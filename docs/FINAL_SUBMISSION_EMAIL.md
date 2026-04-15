# Subject: Visiting Engineer Submission: Adapt AI (Ontology Engine) — Anand Vallamsetla

Hi Andrew and the AI Fund Team,

I am submitting **Adapt AI** for the Visiting Engineer Builder Challenge. I’ve concluded the 48-hour sprint. 

The repository and live prototype are fully functional, but I want to direct your attention to the architectural wedge I prioritized: **The Graph-RAG Ontology Core**.

Most adaptation engines fail at scale because they rely on linear LLM summarization, which degrades into hallucination and context loss. To solve this, I engineered a multi-persona pipeline backed by Neo4j. The system doesn't just read content; it unpacks the underlying ontology, maps the concepts into rigid variable nodes, and *then* routes that structured data to distinct persona synthesis models. 

**Evaluator Fast-Track:**
I respect your time. Two ways to evaluate the core engine without running a local database:
1. **[✨ Showcase Extract](https://github.com/thewhyman/adapt-ai-challenge/blob/main/docs/SHOWCASE.md)**: A side-by-side walkthrough of the ontology extraction → persona adaptation pipeline. Shows the before/after transformation with full rationale for every editorial decision.
2. **[🚀 Live Prototype](https://adapt-ai-challenge.vercel.app/)**: Upload any PDF/DOCX → watch the engine extract the ontological structure → select an audience persona → receive adapted output with transparent rationale.

**Live Resources:**
- **Live Vercel Build:** [https://adapt-ai-challenge.vercel.app/](https://adapt-ai-challenge.vercel.app/)
- **Repository:** [https://github.com/thewhyman/adapt-ai-challenge](https://github.com/thewhyman/adapt-ai-challenge)
- **Problem & Scope:** [docs/PRD.md](https://github.com/thewhyman/adapt-ai-challenge/blob/main/docs/PRD.md)
- **Technical Design:** [docs/TDD.md](https://github.com/thewhyman/adapt-ai-challenge/blob/main/docs/TDD.md)

This submission represents my baseline execution velocity over 48 hours. I view the Visiting Engineer role not as an internship, but as the proving ground for a CEO trajectory. I am looking for the right arena to compound extreme leverage. 

**A note on the broader architecture:** The ontology extraction engine you see in V1 is one module of a substantially larger system I have been developing — a self-evolving multi-agent architecture with a tiered federated intelligence network that enables agents to share learned insights across deployments without exposing underlying data. I filed a provisional patent on the full architecture prior to this submission. I would welcome the opportunity to walk you through the complete vision under NDA.

Looking forward to the evaluation. 

Best,
Anand Vallamsetla
