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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="absolute inset-0 bg-[url('/bg-grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-50"></div>
      
      <header className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs text-white">A</span>
              Adapt AI
            </h1>
            <p className="text-sm font-medium gradient-text mt-0.5">
              Co-Dialectic Persona Engine
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <span>Ontology Extraction</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
            <span>Graph Adaptation</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        
        {step !== "results" && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              Adapt context, not just content.
            </h2>
            <p className="text-center text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
              Transform strict static documents into fluid knowledge targeted uniquely at specific executive functions using our fused-persona engine.
            </p>

            <div className="flex justify-center items-center gap-3">
              <StepBadge number={1} label="Extract Ontology" active={step === "upload"} done={step !== "upload"} />
              <StepDivider />
              <StepBadge number={2} label="Co-Dialectic Target" active={step === "select"} done={step === "results"} />
              <StepDivider />
              <StepBadge number={3} label="Synthesis" active={step === "results"} done={false} />
            </div>
          </div>
        )}

        <div className="transition-all duration-500 ease-out transform">
          {step === "upload" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="glass-panel rounded-2xl p-8">
                <FileUpload
                  onExtracted={handleExtracted}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
              {!isLoading && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center justify-center w-full relative">
                    <hr className="w-full border-zinc-200 dark:border-zinc-800" />
                    <span className="absolute px-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-400 text-sm font-medium z-10">OR</span>
                  </div>
                  <button
                    onClick={() => {
                      handleExtracted({
                        documentId: "doc-eval-demo",
                        title: "Palantir Apollo: Continuous Deployment for the Edge",
                        documentType: "Technical Whitepaper",
                        sectionCount: 4,
                        conceptCount: 18,
                      });
                    }}
                    className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                  >
                    🚀 Run 1-Click Evaluator Demo
                  </button>
                  <p className="mt-3 text-xs text-zinc-500">Bypasses upload and pre-loads a deep-tech whitepaper into the ontology engine.</p>
                </div>
              )}
            </div>
          )}

          {step === "select" && extractResult && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mb-1">Source Ontology Extracted</h3>
                  <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{extractResult.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {extractResult.sectionCount} Nodes</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {extractResult.conceptCount} Edges</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">{extractResult.documentType}</span>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
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
    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md ring-4 ring-zinc-900/10 dark:ring-white/10"
    : done
    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500";

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${active ? 'bg-white/80 dark:bg-zinc-900/80 shadow-sm border border-zinc-200 dark:border-zinc-800' : ''}`}>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${bgClass}`}>
        {done ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : number}
      </span>
      <span className={`text-sm font-semibold tracking-wide ${active ? "text-zinc-900 dark:text-indigo-300" : done ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}`}>
        {label}
      </span>
    </div>
  );
}

function StepDivider() {
  return <div className="w-12 h-[2px] bg-zinc-200 dark:bg-zinc-800 rounded-full" />;
}
