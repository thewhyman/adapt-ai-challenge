---
name: xos-base
version: 0.1.0
description: >
  xOS Base Kernel — three shared engines used by all xOS product skills (xTeamOS,
  xHumanOS, xFamilyOS). Provides: Ingestion Engine (fetch + extract any URL or
  document into structured sections and concepts), Extraction Engine (identify
  marketing angles, audience segments, key claims, and proof points from any content),
  and Persona Engine (read a company or individual's public presence and output a
  voice + audience + platform strategy profile). This skill is a dependency of
  xteamos and other xOS skills — it is not invoked directly by users.
triggers: []
---

# xOS Base Kernel

**This skill is a shared dependency. It defines the three core engines used by xTeamOS and other xOS product skills. Do not expose its triggers to users — xTeamOS and other product skills invoke these engines internally.**

---

## IDENTITY

xOS is a kernel. Like Linux — it provides the fundamental execution primitives that product skills build on. The three engines below are those primitives.

Every xOS product incarnates the kernel for a specific scope:
- **xTeamOS** = kernel + team campaign distribution
- **xHumanOS** = kernel + personal life OS
- **xFamilyOS** = kernel + household coordination

Each product is an LLM skill. The agent IS the engine.

**Deployment model (for product skills that call external APIs):**
```
Skill (LLM instructions, runs in Claude Code)
    ↓ HTTP
API layer (runs anywhere: local dev / Vercel / k8s / OpenClaw cluster)
    ↓ bolt+tls
Graph DB (Neo4j Aura SaaS now → self-hosted later)
```

The kernel engines below are pure LLM operations — no HTTP, no dependencies.
Only the product skills (xTeamOS etc.) make API calls. The kernel just uses
WebFetch for URL reading and file tools for output.

---

## ENGINE 1: INGESTION ENGINE

**Purpose:** Fetch and extract structured content from any URL or pasted document.

**When invoked:** Called first, before any other engine. Takes a URL or raw text as input.

### Protocol

1. **If given a URL:** Use WebFetch / fetch tool to retrieve the page content.
   - Strip navigation, footers, cookie banners, ads — keep body content only.
   - If fetch fails (blocked, paywalled), ask the user to paste the content directly.

2. **Extract structure:** From the raw content, identify:
   - `title` — document/page title
   - `document_type` — product page | blog post | press release | technical doc | announcement | whitepaper
   - `sections[]` — 4–8 meaningful sections, each with:
     - `title` — section heading or inferred label
     - `content` — key substance (2–5 sentences, not verbatim copy)
     - `purpose` — context | core_argument | evidence | differentiator | call_to_action | social_proof
   - `concepts[]` — 5–10 key concepts/terms with:
     - `term` — the concept name
     - `definition` — 1-sentence plain-English definition
     - `technical_depth` — 1 (exec-accessible) to 5 (deep technical)
   - `key_claims[]` — 3–6 specific, quotable claims or stats from the content
   - `audience_assumptions[]` — who the content seems written for originally

3. **Output format (internal, for use by Extraction Engine):**
```
INGESTION RESULT
Title: {title}
Type: {document_type}
Sections: {N}
Concepts: {N}

SECTIONS:
{i}. [{purpose}] {title}
   {content}

KEY CLAIMS:
- {claim}

CONCEPTS:
- {term} (depth {1-5}): {definition}
```

**Quality bar:** Never invent content not present in the source. If a section is unclear, label it `purpose: unknown` rather than guess. Mark hallucination risks with [UNCERTAIN].

---

## ENGINE 2: EXTRACTION ENGINE

**Purpose:** From ingested content, extract the marketing-relevant signal — angles, proof points, audience pain, and differentiators.

**When invoked:** After Ingestion Engine output is ready. Takes ingestion result as input.

### Protocol

1. **Identify marketing angles** — 3 distinct angles to frame this content for promotion:
   - Each angle must be non-obvious (not just restating the product name)
   - Each must lead with the audience's pain, not the product's feature
   - Format: `{angle_title}: {one-sentence hook} | Target: {persona} | Why now: {urgency signal}`

2. **Identify proof points** — concrete, quotable evidence:
   - Stats, percentages, dollar amounts, time savings, customer outcomes
   - Name the source type (proprietary data | case study | analyst report | founder claim)
   - Flag if unverified: `[UNVERIFIED — do not quote without disclosure]`

3. **Identify the primary differentiator:**
   - What makes this genuinely different from the obvious alternative?
   - What would a skeptic say? Answer the skeptic.

4. **Identify audience segments** — who actually cares about this and why:
   - 2–4 segments with: `name | pain | what they want to hear | where they live online`

5. **Output format (internal, for use by Persona Engine + Campaign Engine):**
```
EXTRACTION RESULT
Primary differentiator: {text}

ANGLES:
1. {angle_title}: {hook} | Target: {persona} | Why now: {urgency}
2. ...
3. ...

PROOF POINTS:
- [{source_type}] {claim} {[UNVERIFIED] if applicable}

AUDIENCE SEGMENTS:
{i}. {name}
   Pain: {pain}
   Message: {what they want to hear}
   Platform: {where they live}
```

---

## ENGINE 3: PERSONA ENGINE

**Purpose:** Read a company or individual's public presence and build a voice + audience + platform strategy profile.

**When invoked:** Given a company URL (or individual's profile). Produces the persona used by Campaign Engine to write in the right voice.

### Protocol

1. **Fetch the company website** (or profile URL) using WebFetch.
   - Focus on: About page, homepage hero, blog tone, social bio if linked.
   - Infer from what they write and how — not just what they say they are.

2. **Extract voice profile:**
   - `tone` — e.g., technical-confident | warm-accessible | bold-provocateur | understated-precise
   - `style` — e.g., thought-leadership | practitioner | founder-narrative | data-driven
   - `vocabulary` — 5 characteristic words/phrases this company uses
   - `vocabulary_avoid` — 3 words/phrases that would sound off-brand

3. **Determine hub platform:**
   - Where does their target audience spend professional attention?
   - B2B / enterprise / compliance → LinkedIn
   - Dev tools / technical OSS → GitHub + Reddit + Hacker News
   - Consumer / lifestyle → Instagram + TikTok
   - Finance / trading → X/Twitter
   - Deep technical / research → Substack + arXiv

4. **Determine spoke platforms** — ordered by expected engagement ROI for this audience.

5. **Output format:**
```
PERSONA RESULT
Company: {name}
Domain: {industry/domain}

VOICE:
Tone: {tone}
Style: {style}
Vocabulary: {word1}, {word2}, {word3}, {word4}, {word5}
Avoid: {word1}, {word2}, {word3}

HUB: {platform}
Rationale: {1-2 sentences why}

SPOKES (ordered): {platform1}, {platform2}, {platform3}

AUDIENCE PERSONAS:
{i}. {name} ({primary_platform})
   {1-sentence description}
```

---

## SHARED CONSTRAINTS (apply to all three engines)

- **Zero hallucination.** Only use content that exists in the source. Flag gaps with [GAP].
- **No verbatim copy.** Extract meaning, not sentences. Avoid reproducing copyrighted text.
- **Concise.** Each engine output should be scannable in 30 seconds.
- **Fail gracefully.** If a URL is unfetchable, ask the user to paste content. Never block.
