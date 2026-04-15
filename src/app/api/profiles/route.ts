import { NextRequest, NextResponse } from "next/server";
import { read, toPlain } from "@/lib/neo4j";

const CO_DIALECTIC_PERSONAS = [
  {
    id: "aud-steve-jony",
    name: "Visionary Executive (Steve Jobs + Jony Ive)",
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
    name: "Critical Builder (Linus Torvalds + Shreyas Doshi)",
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
    name: "Growth Marketer (Gary Vee + Seth Godin)",
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
    id: "aud-trade-cfo",
    name: "CFO (Import-Heavy Enterprise)",
    roleName: "Financial Impact Assessment",
    orgLevel: "C-Suite",
    technicalDepth: 2,
    lengthBudget: "brief",
    focusAreas: ["Cost Impact", "Budget Exposure", "Risk Mitigation", "Timeline"],
    terminologyPreference: "business",
    decisionContext: "Needs to know: how much does this cost us, what's the exposure, and what do we do about it. No regulatory jargon — translate to dollars and deadlines."
  },
  {
    id: "aud-trade-counsel",
    name: "Trade Compliance Counsel",
    roleName: "Legal & Regulatory Analysis",
    orgLevel: "VP / General Counsel",
    technicalDepth: 5,
    lengthBudget: "detailed",
    focusAreas: ["HTS Classification", "Exemption Eligibility", "Penalty Risk", "Regulatory Timeline"],
    terminologyPreference: "technical",
    decisionContext: "Needs full regulatory detail: specific HTS codes, exclusion request procedures, penalty calculations, and filing deadlines. This is the person who signs the compliance filings."
  },
  {
    id: "aud-trade-ops",
    name: "Supply Chain VP",
    roleName: "Operations & Sourcing",
    orgLevel: "VP Operations",
    technicalDepth: 3,
    lengthBudget: "moderate",
    focusAreas: ["Supplier Diversification", "Lead Time Impact", "Inventory Strategy", "Alternative Sourcing"],
    terminologyPreference: "business",
    decisionContext: "Needs to know: which suppliers are affected, what's the lead time impact, and where do we source alternatives. Thinks in logistics, not law."
  },
  {
    id: "aud-health-cmo",
    name: "Hospital CMO (Chief Medical Officer)",
    roleName: "Clinical Decision-Maker",
    orgLevel: "C-Suite",
    technicalDepth: 4,
    lengthBudget: "moderate",
    focusAreas: ["Patient Outcomes", "Safety Profile", "Clinical Workflow", "Formulary Decision"],
    terminologyPreference: "technical",
    decisionContext: "Evaluates whether this treatment should enter the hospital formulary. Needs efficacy data, safety signals, and how it fits into existing treatment protocols. Thinks in patient outcomes, not molecular biology."
  },
  {
    id: "aud-health-researcher",
    name: "Principal Investigator (PhD)",
    roleName: "Research & Methodology",
    orgLevel: "Lead Researcher",
    technicalDepth: 5,
    lengthBudget: "detailed",
    focusAreas: ["Study Design", "Statistical Powering", "Mechanism of Action", "Confounders", "Reproducibility"],
    terminologyPreference: "technical",
    decisionContext: "Evaluates the science: is the study design sound, are the endpoints appropriate, is the statistical powering adequate, and what could confound the results? Reads papers for breakfast."
  },
  {
    id: "aud-health-advocate",
    name: "Patient Advocacy Director",
    roleName: "Patient Voice & Access",
    orgLevel: "Director",
    technicalDepth: 1,
    lengthBudget: "brief",
    focusAreas: ["Patient Experience", "Access & Affordability", "Hope vs Hype", "Enrollment"],
    terminologyPreference: "accessible",
    decisionContext: "Represents the 47 million patients with treatment-resistant depression. Needs to know: does this work, is it safe, when can patients access it, and what does enrollment look like? Zero jargon — this person talks to families."
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

const DEMO_PERSONA_MAP: Record<string, string[]> = {
  "doc-demo-landing": ["aud-andrew-ng", "aud-eli-chen", "aud-mike-rubino"],
  "doc-eval-demo": ["aud-steve-jony", "aud-shreyas-linus", "aud-gary-seth"],
  "doc-demo-gaia": ["aud-trade-cfo", "aud-trade-counsel", "aud-trade-ops"],
  "doc-demo-health": ["aud-health-cmo", "aud-health-researcher", "aud-health-advocate"],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    let personas = CO_DIALECTIC_PERSONAS;
    if (documentId && DEMO_PERSONA_MAP[documentId]) {
      const allowedIds = DEMO_PERSONA_MAP[documentId];
      personas = CO_DIALECTIC_PERSONAS.filter(p => allowedIds.includes(p.id));
    }

    const formatsRows = await read(`MATCH (f:OutputFormat) RETURN f ORDER BY f.name`);

    return NextResponse.json({
      audiences: personas,
      formats: formatsRows.map((row) => toPlain((row as Record<string, unknown>).f)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
