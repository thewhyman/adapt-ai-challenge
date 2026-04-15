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
