import "dotenv/config";
import { write } from "../src/lib/neo4j";

const CO_DIALECTIC_PERSONAS = [
  {
    id: "aud-steve-jony",
    name: "The Visionary Builder (Steve Jobs + Jony Ive)",
    roleName: "Product & Design Lead",
    orgLevel: "Executive",
    technicalDepth: 3,
    lengthBudget: "brief",
    focusAreas: ["User Experience", "Product Market Fit", "Simplification"],
    terminologyPreference: "accessible",
    decisionContext: "Focuses entirely on why this matters to the human using it, stripping away all technical bloat or generic corporate speak."
  },
  {
    id: "aud-shreyas-linus",
    name: "The Critical Engineer (Shreyas Doshi + Linus Torvalds)",
    roleName: "Engineering & Product Lead",
    orgLevel: "Director / Principal",
    technicalDepth: 5,
    lengthBudget: "detailed",
    focusAreas: ["Architecture", "Edge Cases", "Scalability", "Trade-offs"],
    terminologyPreference: "technical",
    decisionContext: "Ruthlessly pragmatic. Demands to know the exact technical architecture, failure modes, and why this doesn't over-engineer the core problem."
  },
  {
    id: "aud-nate-reid",
    name: "The Scaled Operator (Nate Silver + Reid Hoffman)",
    roleName: "Growth & Data Executive",
    orgLevel: "C-Suite",
    technicalDepth: 4,
    lengthBudget: "moderate",
    focusAreas: ["Growth Loops", "Data Validity", "Network Effects", "ROI"],
    terminologyPreference: "business",
    decisionContext: "Looks for compounding advantages. Needs to see the data proof and the exact mechanism by which this product or document scales an organization."
  }
];

async function seed() {
  console.log("🌱 Wiping old audiences...");
  await write(`MATCH (a:AudienceProfile) DETACH DELETE a`);
  
  console.log("🌱 Injecting Co-Dialectic Persona Engine...");
  
  for (const aud of CO_DIALECTIC_PERSONAS) {
    await write(`
      MERGE (r:Role {name: $roleName, orgLevel: $orgLevel})
      CREATE (a:AudienceProfile {
        id: $id,
        name: $name,
        technicalDepth: toInteger($technicalDepth),
        lengthBudget: $lengthBudget,
        focusAreas: $focusAreas,
        terminologyPreference: $terminologyPreference,
        decisionContext: $decisionContext
      })
      CREATE (a)-[:TARGETS_ROLE]->(r)
    `, {
      id: aud.id,
      name: aud.name,
      roleName: aud.roleName,
      orgLevel: aud.orgLevel,
      technicalDepth: aud.technicalDepth,
      lengthBudget: aud.lengthBudget,
      focusAreas: aud.focusAreas,
      terminologyPreference: aud.terminologyPreference,
      decisionContext: aud.decisionContext
    });
    console.log(`✅ Seeded: ${aud.name}`);
  }
  console.log("🎉 Complete!");
  process.exit(0);
}

seed().catch(console.error);
