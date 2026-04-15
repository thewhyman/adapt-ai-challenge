import { NextResponse } from "next/server";
import { read, toPlain } from "@/lib/neo4j";

const CO_DIALECTIC_PERSONAS = [
  {
    id: "aud-steve-jony",
    name: "The Visionary Executive (Steve Jobs + Jony Ive)",
    roleName: "Product Vision & Design",
    orgLevel: "CEO / CPO",
    technicalDepth: 3,
    lengthBudget: "brief",
    focusAreas: ["User Experience", "Product Vision", "Simplification", "Why It Matters"],
    terminologyPreference: "accessible",
    decisionContext: "Focuses entirely on why this matters to the human using it. Strips all technical bloat. Thinks in product vision and human impact."
  },
  {
    id: "aud-shreyas-linus",
    name: "The Critical Builder (Linus Torvalds + Shreyas Doshi)",
    roleName: "Architecture & Engineering",
    orgLevel: "Principal / Staff Engineer",
    technicalDepth: 5,
    lengthBudget: "detailed",
    focusAreas: ["Architecture", "Failure Modes", "Scalability", "Trade-offs"],
    terminologyPreference: "technical",
    decisionContext: "Ruthlessly pragmatic. Demands exact technical architecture, failure modes, and what could break. Show the code-level truth."
  },
  {
    id: "aud-gary-seth",
    name: "The Growth Marketer (Gary Vee + Seth Godin)",
    roleName: "Marketing & Distribution",
    orgLevel: "CMO / Head of Growth",
    technicalDepth: 2,
    lengthBudget: "moderate",
    focusAreas: ["Distribution", "Platform-Native Content", "Audience Empathy", "Content That Spreads"],
    terminologyPreference: "accessible",
    decisionContext: "Thinks in hooks, distribution channels, and audience psychology. Adapts content for LinkedIn, Twitter, blogs, and sales decks. Makes every piece of content work harder."
  },
  {
    id: "aud-andrew-ng",
    name: "Andrew Ng (CEO, Landing AI · GP, AI Fund)",
    roleName: "AI Investor & Technical CEO",
    orgLevel: "CEO / Managing GP",
    technicalDepth: 5,
    lengthBudget: "brief",
    focusAreas: ["AI/ML Technical Depth", "Product-Market Fit", "Data-Centric AI", "Scalability", "Team Signal"],
    terminologyPreference: "technical",
    decisionContext: "Stanford professor, Google Brain co-founder. Thinks in data-centric AI, systematic ML workflows, and whether the technical approach is principled. Demands both technical rigor AND product clarity. Asks: does this solve a real problem for real users, and is the AI approach sound?"
  },
  {
    id: "aud-eli-chen",
    name: "Eli Chen (CTO, AI Fund · Ex-Credo AI)",
    roleName: "Technical Due Diligence",
    orgLevel: "CTO",
    technicalDepth: 5,
    lengthBudget: "detailed",
    focusAreas: ["System Architecture", "AI Governance", "Scalability", "Build vs Buy", "Technical Debt"],
    terminologyPreference: "technical",
    decisionContext: "Former CTO of Credo AI (AI governance). Evaluates whether the architecture can actually be built, scaled, and maintained by a small team. Looks for engineering maturity signals: error handling, edge cases, monitoring, and honest trade-off documentation."
  },
  {
    id: "aud-mike-rubino",
    name: "Mike Rubino (Head of Talent, AI Fund · Ex-Neuralink)",
    roleName: "Founder Assessment",
    orgLevel: "Head of Talent",
    technicalDepth: 3,
    lengthBudget: "brief",
    focusAreas: ["Builder Signal", "Execution Velocity", "Leadership Potential", "Team Gaps"],
    terminologyPreference: "accessible",
    decisionContext: "Ex-Neuralink, ex-AWS. Evaluates founders, not just their tech. Looks for: did they build the thing or just describe it? How fast did they ship? Can they recruit? Do they have the grit and self-awareness to lead a company through the chaos of zero-to-one?"
  }
];

export async function GET() {
  try {
    // We override the DB audience lookup to inject the static Co-Dialectic Personas
    // but still fetch the dynamic Output Formats from Neo4j.
    const formatsRows = await read(`MATCH (f:OutputFormat) RETURN f ORDER BY f.name`);
    
    return NextResponse.json({
      audiences: CO_DIALECTIC_PERSONAS,
      formats: formatsRows.map((row) => toPlain((row as Record<string, unknown>).f)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
