"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import AdaptSelector from "@/components/AdaptSelector";
import ResultsView from "@/components/ResultsView";

type Step = "upload" | "select" | "results";

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
  rationale: {
    kept: string[];
    simplified: string[];
    expanded: string[];
    cut: string[];
    terminologyChanges: { original: string; adapted: string; reason: string }[];
  };
}

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [adaptResult, setAdaptResult] = useState<AdaptResult | null>(null);

  function handleExtracted(result: ExtractResult) {
    setExtractResult(result);
    setStep("select");
  }

  function handleAdapted(result: AdaptResult) {
    setAdaptResult(result);
    setStep("results");
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

  function handleEvalDemo() {
    setExtractResult({
      documentId: "doc-eval-demo",
      title: "Palantir Apollo: Continuous Deployment for the Edge",
      documentType: "Architecture Brief",
      sectionCount: 3,
      conceptCount: 3,
    });
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
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-zinc-400">
            <span>Ontology Extraction</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>Graph Adaptation</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        
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
            <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto animate-fade-in">
              <FileUpload
                onExtracted={handleExtracted}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
              <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
                <button
                  type="button"
                  onClick={handleEvalDemo}
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Or try the 1-Click Evaluator Demo (Palantir Apollo brief)
                </button>
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
                onReset={handleReset}
                onNewAdaptation={handleNewAdaptation}
              />
            </div>
          )}
        </div>
      </main>
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
