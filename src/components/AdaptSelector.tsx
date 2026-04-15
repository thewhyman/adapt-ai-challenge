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

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          audienceId: selectedAudience,
          formatId: selectedFormat,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Adaptation failed" }));
        throw new Error(body.error ?? `Adaptation failed (${res.status})`);
      }

      const result = await res.json();
      onAdapted({
        adaptationId: result.adaptationId,
        audienceName: result.audienceName,
        formatName: result.formatName,
        adaptedContent: result.adaptedContent,
        reliability: result.reliability,
        rationale: { ...result.rationale, gaps: result.rationale.gaps || [] },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adaptation failed");
    } finally {
      setIsLoading(false);
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

      {/* Adapt error */}
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Adapt button */}
      <button
        type="button"
        disabled={!canAdapt}
        onClick={handleAdapt}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading ? "Adapting..." : "Adapt"}
      </button>
    </div>
  );
}
