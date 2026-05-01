"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import AdaptSelector from "@/components/AdaptSelector";
import ResultsView from "@/components/ResultsView";
import CampaignGenerator from "@/components/CampaignGenerator";

type Step = "upload" | "select" | "results";
type Mode = "adapt" | "campaign" | "architecture";

interface ExtractResult {
  documentId: string;
  title: string;
  documentType: string;
  sectionCount: number;
  conceptCount: number;
}

interface AdaptResult {
  adaptationId: string;
  audienceName: string;
  formatName: string;
  adaptedContent: string;
  reliability?: number;
  wordCount?: number;
  generationTime?: string;
  rationale: {
    kept: string[];
    simplified: string[];
    expanded: string[];
    cut: string[];
    terminologyChanges: { original: string; adapted: string; reason: string }[];
    gaps?: string[];
  };
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("adapt");
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [adaptResult, setAdaptResult] = useState<AdaptResult | null>(null);

  const DEMOS = [
    { id: "doc-demo-landing", title: "Landing AI: Visual Inspection Report", documentType: "Quality Report", sectionCount: 5, conceptCount: 4, tag: "Manufacturing AI", tagClass: "bg-orange-500/20 text-orange-400", description: "Computer vision defect detection for PCB assembly" },
    { id: "doc-demo-gaia", title: "Gaia Dynamics: Tariff Compliance Brief", documentType: "Compliance Brief", sectionCount: 4, conceptCount: 5, tag: "Trade Compliance", tagClass: "bg-cyan-500/20 text-cyan-400", description: "AI-driven tariff analysis for US importers" },
    { id: "doc-demo-health", title: "Clinical Trial Protocol: AI Drug Discovery", documentType: "Clinical Protocol", sectionCount: 6, conceptCount: 5, tag: "Healthcare AI", tagClass: "bg-emerald-500/20 text-emerald-400", description: "Phase II trial for AI-identified antidepressant" },
    { id: "doc-eval-demo", title: "Palantir Apollo: Edge Deployment", documentType: "Architecture Brief", sectionCount: 3, conceptCount: 3, tag: "Defense Tech", tagClass: "bg-indigo-500/20 text-indigo-400", description: "Autonomous deployment to air-gapped environments" },
  ];

  function handleExtracted(result: ExtractResult) {
    setExtractResult(result);
    setStep("select");
    window.scrollTo(0, 0);
  }

  function handleAdapted(result: AdaptResult) {
    setAdaptResult(result);
    setStep("results");
    window.scrollTo(0, 0);
  }

  function handleReset() {
    setExtractResult(null);
    setAdaptResult(null);
    setStep("upload");
  }

  function handleNewAdaptation() {
    setAdaptResult(null);
    setStep("select");
  }

  function handleDemoClick(id: string, title: string, docType: string, sections: number, concepts: number) {
    setExtractResult({ documentId: id, title, documentType: docType, sectionCount: sections, conceptCount: concepts });
    setStep("select");
  }

  return (
    <div className="min-h-screen bg-zinc-950 transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('/bg-grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      <div className="ambient-glow ambient-glow-blue"></div>
      <div className="ambient-glow ambient-glow-indigo"></div>
      
      <header className="relative border-b border-white/[0.06] bg-black/30 backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs text-white shadow-lg shadow-indigo-500/25">A</span>
              Adapt AI
            </h1>
            <p className="text-sm font-medium gradient-text mt-0.5">
              Co-Dialectic Persona Engine
            </p>
          </div>
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <button
              onClick={() => setMode("adapt")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "adapt"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Adapt Document
            </button>
            <button
              onClick={() => setMode("campaign")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "campaign"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ✦ Campaign Generator
            </button>
            <button
              onClick={() => setMode("architecture")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "architecture"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              How It Works
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">

        {mode === "architecture" ? (
          <div className="animate-fade-in">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-zinc-50 mb-2">How It Works</h2>
              <p className="text-zinc-400 text-base">Three decoupled phases. Extract once. Adapt infinitely.</p>
            </div>
            <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
              <svg width="1050" height="720" viewBox="0 0 1100 720" xmlns="http://www.w3.org/2000/svg" style={{minWidth: '800px'}}>
                <defs>
                  <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#4b5563"/></marker>
                  <marker id="arr-blue" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/></marker>
                  <marker id="arr-purple" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/></marker>
                  <marker id="arr-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/></marker>
                </defs>
                {/* Phase 1 - System Setup */}
                <rect x="0" y="0" width="1100" height="192" fill="#0e0b1e" rx="12"/>
                <text x="30" y="22" fill="#8b5cf6" fontFamily="-apple-system,sans-serif" fontSize="11" fontWeight="700" letterSpacing="2">SYSTEM SETUP — ONCE PER COMPANY · REUSED ACROSS EVERY DOCUMENT</text>
                <rect x="30" y="32" width="140" height="68" rx="10" fill="#160f2b" stroke="#6d28d9" strokeWidth="1.5"/>
                <text x="100" y="59" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Name</text>
                <text x="100" y="77" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">Executive · Eli Chen</text>
                <text x="100" y="92" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">role or real person</text>
                <rect x="180" y="32" width="170" height="68" rx="10" fill="#160f2b" stroke="#6d28d9" strokeWidth="1.5"/>
                <text x="265" y="59" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">ComplexityThreshold</text>
                <text x="265" y="77" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">1–5 score</text>
                <text x="265" y="92" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">Exec ≤2 · Tech IC ≥3</text>
                <rect x="360" y="32" width="170" height="68" rx="10" fill="#160f2b" stroke="#6d28d9" strokeWidth="1.5"/>
                <text x="445" y="59" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">DomainAssumptions</text>
                <text x="445" y="77" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">what they already know</text>
                <text x="445" y="92" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">skip basics · go deeper</text>
                <line x1="531" y1="66" x2="567" y2="66" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arr-purple)"/>
                <rect x="569" y="22" width="215" height="88" rx="12" fill="#1e0f40" stroke="#7c3aed" strokeWidth="2"/>
                <text x="676" y="52" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="15" fontWeight="700">AudienceProfile</text>
                <text x="676" y="72" textAnchor="middle" fill="#a78bfa" fontFamily="-apple-system,sans-serif" fontSize="11">Node in Neo4j · Persistent</text>
                <text x="676" y="90" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="10">Reusable across every document</text>
                <rect x="30" y="118" width="140" height="60" rx="10" fill="#0d1f17" stroke="#065f46" strokeWidth="1.5"/>
                <text x="100" y="143" textAnchor="middle" fill="#6ee7b7" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Format</text>
                <text x="100" y="162" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="10">Brief · Spec · One-Pager</text>
                <rect x="180" y="118" width="170" height="60" rx="10" fill="#0d1f17" stroke="#065f46" strokeWidth="1.5"/>
                <text x="265" y="143" textAnchor="middle" fill="#6ee7b7" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Voice</text>
                <text x="265" y="162" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="10">Formal · Technical · Sales</text>
                <rect x="360" y="118" width="170" height="60" rx="10" fill="#0d1f17" stroke="#065f46" strokeWidth="1.5"/>
                <text x="445" y="143" textAnchor="middle" fill="#6ee7b7" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Length</text>
                <text x="445" y="162" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="10">1-page · deep-dive · summary</text>
                <line x1="531" y1="148" x2="567" y2="148" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-green)"/>
                <rect x="569" y="110" width="215" height="80" rx="12" fill="#0d2010" stroke="#16a34a" strokeWidth="2"/>
                <text x="676" y="140" textAnchor="middle" fill="#4ade80" fontFamily="-apple-system,sans-serif" fontSize="15" fontWeight="700">OutputFormat</text>
                <text x="676" y="160" textAnchor="middle" fill="#86efac" fontFamily="-apple-system,sans-serif" fontSize="11">Node in Neo4j · Persistent</text>
                <text x="676" y="178" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="10">Reusable across every document</text>
                {/* Phase 2 - Document Ingestion */}
                <rect x="0" y="202" width="1100" height="168" fill="#0d0d1f"/>
                <text x="30" y="222" fill="#6366f1" fontFamily="-apple-system,sans-serif" fontSize="11" fontWeight="700" letterSpacing="2">DOCUMENT INGESTION — ONCE PER DOC · RE-RUN ONLY WHEN DOC CHANGES</text>
                <rect x="30" y="234" width="155" height="82" rx="10" fill="#13132b" stroke="#3b3f8c" strokeWidth="1.5"/>
                <text x="107" y="263" textAnchor="middle" fill="#a0a8ff" fontFamily="-apple-system,sans-serif" fontSize="14" fontWeight="600">Document</text>
                <text x="107" y="283" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">PDF / Word</text>
                <text x="107" y="302" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">any format</text>
                <line x1="186" y1="275" x2="224" y2="275" stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arr)"/>
                <rect x="226" y="234" width="155" height="82" rx="10" fill="#13132b" stroke="#3b3f8c" strokeWidth="1.5"/>
                <text x="303" y="263" textAnchor="middle" fill="#a0a8ff" fontFamily="-apple-system,sans-serif" fontSize="14" fontWeight="600">Claude</text>
                <text x="303" y="283" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">Haiku · Extract</text>
                <text x="303" y="302" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">Pass 1</text>
                <line x1="382" y1="275" x2="420" y2="275" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arr-blue)"/>
                <rect x="422" y="222" width="430" height="118" rx="12" fill="#0d1f40" stroke="#1d4ed8" strokeWidth="2"/>
                <text x="637" y="252" textAnchor="middle" fill="#60a5fa" fontFamily="-apple-system,sans-serif" fontSize="16" fontWeight="700">KnowledgeGraph</text>
                <line x1="442" y1="262" x2="832" y2="262" stroke="#1e3a6e" strokeWidth="1"/>
                <text x="637" y="283" textAnchor="middle" fill="#93c5fd" fontFamily="-apple-system,sans-serif" fontSize="12">Sections × Concepts × Relationships × Complexity × Organizations</text>
                <text x="637" y="305" textAnchor="middle" fill="#4b6fa8" fontFamily="-apple-system,sans-serif" fontSize="11">Stored in Neo4j as a property graph</text>
                <text x="637" y="326" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="10" fontStyle="italic">Add new personas anytime — no re-ingestion needed</text>
                {/* Phase 3 - Adapt */}
                <rect x="0" y="380" width="1100" height="218" fill="#0a1208"/>
                <text x="30" y="400" fill="#22c55e" fontFamily="-apple-system,sans-serif" fontSize="11" fontWeight="700" letterSpacing="2">ADAPT — UNLIMITED RUNS · NEW PERSONA OR FORMAT = NO RE-INGESTION NEEDED</text>
                <rect x="30" y="414" width="148" height="72" rx="10" fill="#0d1f40" stroke="#1d4ed8" strokeWidth="1.5"/>
                <text x="104" y="444" textAnchor="middle" fill="#60a5fa" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Knowledge</text>
                <text x="104" y="463" textAnchor="middle" fill="#60a5fa" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Graph</text>
                <text x="104" y="480" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="10">already in Neo4j</text>
                <text x="192" y="454" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="22">×</text>
                <rect x="206" y="414" width="148" height="72" rx="10" fill="#1e0f40" stroke="#7c3aed" strokeWidth="1.5"/>
                <text x="280" y="444" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Audience</text>
                <text x="280" y="463" textAnchor="middle" fill="#c4b5fd" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Profile</text>
                <text x="280" y="480" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="10">pick or add new</text>
                <text x="368" y="454" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="22">×</text>
                <rect x="382" y="414" width="148" height="72" rx="10" fill="#0d2010" stroke="#16a34a" strokeWidth="1.5"/>
                <text x="456" y="444" textAnchor="middle" fill="#4ade80" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Output</text>
                <text x="456" y="463" textAnchor="middle" fill="#4ade80" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">Format</text>
                <text x="456" y="480" textAnchor="middle" fill="#374151" fontFamily="-apple-system,sans-serif" fontSize="10">pick or add new</text>
                <line x1="532" y1="450" x2="572" y2="450" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arr-green)"/>
                <rect x="574" y="414" width="120" height="72" rx="10" fill="#0a1f0a" stroke="#16a34a" strokeWidth="2"/>
                <text x="634" y="444" textAnchor="middle" fill="#4ade80" fontFamily="-apple-system,sans-serif" fontSize="14" fontWeight="700">Traverse</text>
                <text x="634" y="463" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">Graph Query</text>
                <text x="634" y="480" textAnchor="middle" fill="#4b5563" fontFamily="-apple-system,sans-serif" fontSize="10">Claude Sonnet</text>
                <line x1="696" y1="450" x2="734" y2="450" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arr-green)"/>
                <rect x="736" y="390" width="260" height="162" rx="12" fill="#0f1f0f" stroke="#16a34a" strokeWidth="2"/>
                <text x="866" y="420" textAnchor="middle" fill="#4ade80" fontFamily="-apple-system,sans-serif" fontSize="15" fontWeight="700">AdaptedDocument</text>
                <line x1="756" y1="430" x2="976" y2="430" stroke="#1f3320" strokeWidth="1"/>
                <text x="866" y="454" textAnchor="middle" fill="#6ee7b7" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">+ Rationale</text>
                <text x="866" y="472" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">kept · simplified · cut</text>
                <line x1="756" y1="484" x2="976" y2="484" stroke="#1f3320" strokeWidth="1"/>
                <text x="866" y="508" textAnchor="middle" fill="#f87171" fontFamily="-apple-system,sans-serif" fontSize="13" fontWeight="600">+ Gaps</text>
                <text x="866" y="526" textAnchor="middle" fill="#6b7280" fontFamily="-apple-system,sans-serif" fontSize="11">what was needed · not in document</text>
                {/* Soundbite */}
                <rect x="0" y="608" width="1100" height="112" fill="#09090b"/>
                <line x1="0" y1="608" x2="1100" y2="608" stroke="#1f2937" strokeWidth="1"/>
                <text x="550" y="640" textAnchor="middle" fill="#9ca3af" fontFamily="-apple-system,sans-serif" fontSize="13" fontStyle="italic">&quot;ChatGPT prompts are ephemeral — every session starts from zero.</text>
                <text x="550" y="662" textAnchor="middle" fill="#9ca3af" fontFamily="-apple-system,sans-serif" fontSize="13" fontStyle="italic">Adapt AI&apos;s nodes are permanent — the company owns their audience taxonomy.</text>
                <text x="550" y="690" textAnchor="middle" fill="#e5e7eb" fontFamily="-apple-system,sans-serif" fontSize="14" fontWeight="700">That&apos;s a data moat, not just a product moat.</text>
              </svg>
            </div>
          </div>
        ) : mode === "campaign" ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-10 animate-fade-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight text-zinc-50 mb-4">
                Input anything. Get a campaign.
              </h2>
              <p className="text-center text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
                Give xTeamOS your company website and a product URL. It learns your voice, your audience, and the platform rules — then outputs every asset and a full publishing plan.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-8">
              <CampaignGenerator />
            </div>
          </div>
        ) : (
          <>
        {step !== "results" && (
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight text-zinc-50 mb-4 animate-fade-in">
              Adapt context, not just content.
            </h2>
            <p className="text-center text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-12 animate-fade-in-delay-1">
              Transform dense documents into targeted intelligence for any audience — powered by ontology extraction and persona-driven synthesis.
            </p>

            <div className="flex justify-center items-center gap-3 animate-fade-in-delay-2">
              <StepBadge number={1} label="Extract Ontology" active={step === "upload"} done={step !== "upload"} />
              <StepDivider />
              <StepBadge number={2} label="Co-Dialectic Target" active={step === "select"} done={false} />
              <StepDivider />
              <StepBadge number={3} label="Synthesis" active={step === "results"} done={false} />
            </div>
          </div>
        )}

        <div className="transition-all duration-500 ease-out transform">
          {step === "upload" && (
            <div className="space-y-8 animate-fade-in">
              {/* Demo cards */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 text-center">Try a demo — AI Fund portfolio verticals</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
                  {DEMOS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDemoClick(d.id, d.title, d.documentType, d.sectionCount, d.conceptCount)}
                      className="glass-panel rounded-xl p-4 text-left hover:border-white/20 transition-all group"
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.tagClass}`}>{d.tag}</span>
                      <p className="text-sm font-semibold text-zinc-100 mt-2 group-hover:text-white transition-colors">{d.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">{d.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload */}
              <div>
                <p className="text-sm text-zinc-500 text-center mb-2">Or upload your own document</p>
              <p className="text-xs text-zinc-600 text-center mb-4">Need a PDF? Try <a href="/rayban-v4-product-spec.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Ray-Ban Meta v4 Product Spec</a> or <a href="/gaia-dynamics-product-spec.pdf" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Gaia Dynamics Product Spec</a></p>
                <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto">
                  <FileUpload
                    onExtracted={handleExtracted}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "select" && extractResult && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between animate-fade-in">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-indigo-400 uppercase mb-1">Source Ontology Extracted</h3>
                  <h2 className="text-xl font-medium text-zinc-100">{extractResult.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span> {extractResult.sectionCount} Nodes</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> {extractResult.conceptCount} Edges</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">{extractResult.documentType}</span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Change Origin
                </button>
              </div>

              <div className="glass-panel p-8 rounded-2xl">
                <AdaptSelector
                  documentId={extractResult.documentId}
                  documentTitle={extractResult.title}
                  onAdapted={handleAdapted}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            </div>
          )}

          {step === "results" && adaptResult && (
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
              <ResultsView
                audienceName={adaptResult.audienceName}
                formatName={adaptResult.formatName}
                adaptedContent={adaptResult.adaptedContent}
                rationale={adaptResult.rationale}
                reliability={adaptResult.reliability}
                wordCount={adaptResult.wordCount}
                generationTime={adaptResult.generationTime}
                onReset={handleReset}
                onNewAdaptation={handleNewAdaptation}
              />
            </div>
          )}
        </div>
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] py-4 text-center">
        <p className="text-[11px] text-zinc-600">Adapt AI · AI Fund Builder Challenge · deploy 2026-04-15 03:19 PDT</p>
      </footer>
    </div>
  );
}

function StepBadge({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  const bgClass = active
    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
    : done
    ? "bg-indigo-900/30 text-indigo-400"
    : "bg-zinc-800 text-zinc-500";

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${active ? 'bg-zinc-900/80 shadow-sm border border-white/[0.08] step-active-glow' : ''}`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${bgClass}`}>
        {done ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : number}
      </span>
      <span className={`text-sm font-semibold tracking-wide ${active ? "text-indigo-300" : done ? "text-indigo-400" : "text-zinc-500"}`}>
        {label}
      </span>
    </div>
  );
}

function StepDivider() {
  return <div className="w-12 h-[2px] bg-zinc-800 rounded-full" />;
}
