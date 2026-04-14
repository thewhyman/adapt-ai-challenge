// ── Dublin Core Layer ──

export interface Document {
  id: string;
  title: string;
  documentType: "technical_doc" | "training_material" | "research" | "sop" | "general";
  overallComplexity: 1 | 2 | 3 | 4 | 5;
  audienceAssumptions: string[];
  rawContent: string;
  dcCreator: string;
  dcDate: string;
  dcDescription: string;
  dcFormat: string;
  dcLanguage: string;
  dcSubject: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  content: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  purpose: "context" | "core_argument" | "evidence" | "action_item" | "reference";
  orderIndex: number;
}

// ── SKOS Layer ──

export interface ConceptScheme {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  technicalDepth: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

// ── W3C ORG Layer ──

export interface Organization {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  orgLevel: string;
  decisionScope: string;
}

// ── Adapt AI Custom Layer ──

export interface AudienceProfile {
  id: string;
  name: string;
  technicalDepth: 1 | 2 | 3 | 4 | 5;
  lengthBudget: "brief" | "moderate" | "detailed";
  focusAreas: string[];
  terminologyPreference: "business" | "technical" | "accessible";
  decisionContext: string;
}

export interface OutputFormat {
  id: string;
  name: string;
  description: string;
  maxWords: number;
  structure: string[];
}

export interface Adaptation {
  id: string;
  adaptedContent: string;
  rationaleKept: string[];
  rationaleSimplified: string[];
  rationaleExpanded: string[];
  rationaleCut: string[];
  terminologyChanges: string[];
  createdAt: string;
}

// ── Composite types for API responses ──

export interface ContentGraph {
  document: Document;
  sections: Section[];
  concepts: Concept[];
  conceptScheme: ConceptScheme | null;
  dependencies: { from: string; to: string }[];
  conceptRelations: { from: string; to: string }[];
  sectionConcepts: { sectionId: string; conceptId: string }[];
}

export interface AdaptationResult {
  adaptation: Adaptation;
  audienceProfile: AudienceProfile;
  outputFormat: OutputFormat;
}
