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

  if (step === "results" && adaptResult) {
    return (
      <ResultsView
        audienceName={adaptResult.audienceName}
        formatName={adaptResult.formatName}
        adaptedContent={adaptResult.adaptedContent}
        rationale={adaptResult.rationale}
        onReset={handleReset}
        onNewAdaptation={handleNewAdaptation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Adapt AI</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a document, extract its structure, adapt it for different audiences.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge number={1} label="Upload" active={step === "upload"} done={step !== "upload"} />
          <StepDivider />
          <StepBadge number={2} label="Adapt" active={step === "select"} done={step === "results"} />
          <StepDivider />
          <StepBadge number={3} label="Results" active={step === "results"} done={false} />
        </div>

        {step === "upload" && (
          <FileUpload
            onExtracted={handleExtracted}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        {step === "select" && extractResult && (
          <div>
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{extractResult.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {extractResult.sectionCount} sections &middot; {extractResult.conceptCount} concepts &middot; {extractResult.documentType}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Change document
                </button>
              </div>
            </div>

            <AdaptSelector
              documentId={extractResult.documentId}
              documentTitle={extractResult.title}
              onAdapted={handleAdapted}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function StepBadge({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  const bgClass = active
    ? "bg-gray-900 text-white"
    : done
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-400";

  return (
    <div className="flex items-center gap-2">
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${bgClass}`}>
        {done ? "✓" : number}
      </span>
      <span className={`text-sm font-medium ${active ? "text-gray-900" : done ? "text-green-700" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}

function StepDivider() {
  return <div className="flex-1 h-px bg-gray-200 max-w-[60px]" />;
}
