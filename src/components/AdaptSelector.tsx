"use client";

import { useEffect, useState } from "react";

// ── Types matching the /api/profiles response shape ──

interface Audience {
  id: string;
  name: string;
  technicalDepth: 1 | 2 | 3 | 4 | 5;
  lengthBudget: "brief" | "moderate" | "detailed";
  focusAreas: string[];
  terminologyPreference: "business" | "technical" | "accessible";
  decisionContext: string;
  roleName: string;
  orgLevel: string;
}

interface Format {
  id: string;
  name: string;
  description: string;
  maxWords: number;
  structure: string[];
}

// ── Props ──

interface AdaptSelectorProps {
  documentId: string;
  documentTitle: string;
  onAdapted: (result: {
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
      gaps?: string[];
    };
  }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// ── Helpers ──

const DEPTH_LABELS: Record<number, string> = {
  1: "Non-technical",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function audienceDescription(a: Audience): string {
  const depth = DEPTH_LABELS[a.technicalDepth] ?? `Level ${a.technicalDepth}`;
  return `${depth} depth, ${a.lengthBudget} length, ${a.terminologyPreference} language`;
}

const ALL_ADAPT_STEPS = [
  "Reading structure",
  "Adapting for persona",
  "Analyzing gaps",
  "Validating with independent model",
  "Scoring reliability",
];

// ── Component ──

export default function AdaptSelector({
  documentId,
  documentTitle,
  onAdapted,
  isLoading,
  setIsLoading,
}: AdaptSelectorProps) {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<{ step: string; elapsed: string }[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        const res = await fetch(`/api/profiles?documentId=${encodeURIComponent(documentId)}`);
        if (!res.ok) {
          throw new Error(`Failed to load profiles (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setAudiences(data.audiences ?? []);
          setFormats(data.formats ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : "Failed to load profiles");
        }
      }
    }

    loadProfiles();
    return () => { cancelled = true; };
  }, []);

  async function handleAdapt() {
    if (!selectedAudience || !selectedFormat) return;

    setError(null);
    setIsLoading(true);
    setProgressSteps([]);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, audienceId: selectedAudience, formatId: selectedFormat }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const eventMatch = block.match(/^event: (\w+)\ndata: (.+)$/s);
            if (!eventMatch) continue;
            const [, event, dataStr] = eventMatch;
            const data = JSON.parse(dataStr);

            if (event === "progress") {
              setProgressSteps(prev => {
                const exists = prev.find(p => p.step === data.step);
                if (exists) return prev.map(p => p.step === data.step ? { step: data.step, elapsed: data.elapsed || "" } : p);
                return [...prev, { step: data.step, elapsed: data.elapsed || "" }];
              });
            } else if (event === "error") {
              throw new Error(data.error);
            } else if (event === "result") {
              onAdapted({
                adaptationId: data.adaptationId,
                audienceName: data.audienceName,
                formatName: data.formatName,
                adaptedContent: data.adaptedContent,
                reliability: data.reliability,
                wordCount: data.wordCount,
                generationTime: data.generationTime,
                rationale: { ...data.rationale, gaps: data.rationale.gaps || [] },
              });
            }
          }
        }
      } else {
        const text = await res.text();
        let result;
        try { result = JSON.parse(text); } catch { throw new Error("Unexpected response."); }
        if (!res.ok) throw new Error(result.error ?? `Failed (${res.status})`);
        onAdapted({
          adaptationId: result.adaptationId,
          audienceName: result.audienceName,
          formatName: result.formatName,
          adaptedContent: result.adaptedContent,
          reliability: result.reliability,
          wordCount: result.wordCount,
          generationTime: result.generationTime,
          rationale: { ...result.rationale, gaps: result.rationale?.gaps || [] },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adaptation failed");
    } finally {
      setIsLoading(false);
      setProgressSteps([]);
    }
  }

  const canAdapt = selectedAudience !== null && selectedFormat !== null && !isLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Adapt Document
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose an audience and format for{" "}
          <span className="font-medium text-zinc-300">
            {documentTitle}
          </span>
        </p>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
          {fetchError}
        </div>
      )}

      {/* Audience cards */}
      <fieldset disabled={isLoading}>
        <legend className="mb-3 text-sm font-medium text-zinc-300">
          Target Audience
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => {
            const selected = selectedAudience === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAudience(a.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? "border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-zinc-700/50 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80"
                }`}
              >
                <p className="text-base font-bold text-zinc-50">
                  {a.name.split('(')[0].trim()}
                </p>
                {a.name.includes('(') && (
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">
                    {a.name.match(/\(([^)]+)\)/)?.[1]}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-zinc-500">
                  {a.roleName} · {a.orgLevel}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Format cards */}
      <fieldset disabled={isLoading}>
        <legend className="mb-3 text-sm font-medium text-zinc-300">
          Output Format
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {formats.map((f) => {
            const selected = selectedFormat === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? "border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-zinc-700/50 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80"
                }`}
              >
                <p className="font-medium text-zinc-100">
                  {f.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  up to {f.maxWords.toLocaleString()} words
                </p>
                <ul className="mt-2 space-y-0.5 text-sm text-zinc-400">
                  {f.structure.map((s) => (
                    <li key={s} className="flex items-start gap-1.5">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Adapt error with retry */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 flex items-center justify-between">
          <span className="text-sm text-red-400">{error}</span>
          <button type="button" onClick={handleAdapt} className="ml-4 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Adapt button */}
      <button
        type="button"
        disabled={!canAdapt}
        onClick={handleAdapt}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adapt
      </button>

      {isLoading && (
        <div className="mt-5 space-y-3">
          {ALL_ADAPT_STEPS.map((label, i) => {
            const match = progressSteps.find(p => p.step.startsWith(label));
            const isCompleted = match && progressSteps.some((p, j) => j > progressSteps.indexOf(match!) && p.step !== match!.step);
            const isActive = match && !isCompleted;
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  isCompleted ? "bg-emerald-500/20 text-emerald-400" : isActive ? "bg-indigo-500/20 text-indigo-400 animate-pulse" : "bg-zinc-800 text-zinc-600"
                }`}>
                  {isCompleted ? "✓" : isActive ? "●" : "○"}
                </div>
                <span className={`font-medium ${isCompleted ? "text-zinc-400" : isActive ? "text-zinc-200" : "text-zinc-600"}`}>{label}</span>
                {match?.elapsed && <span className="text-zinc-600 text-xs">{match.elapsed}s</span>}
              </div>
            );
          })}
          <p className="text-[11px] text-zinc-600 mt-2 ml-8">running on micro-infra to conserve costs</p>
        </div>
      )}
    </div>
  );
}

