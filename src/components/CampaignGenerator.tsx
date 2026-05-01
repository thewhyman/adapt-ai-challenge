"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonaResult {
  personaId: string;
  companyName: string;
  domain: string;
  hubPlatform: string;
  hubRationale: string;
  spokePlatforms: string[];
  audiencePersonas: { id: string; name: string; description: string; primaryPlatform: string }[];
  voice: { tone: string; style: string };
}

interface SwarmReview {
  recommendation: "SHIP" | "REVISE" | "HOLD";
  codex: { issues: { severity: string; platform?: string; issue: string; fix?: string }[]; blockerCount: number };
  gemini: { dimensions: { dimension?: string; section?: string; score: number; note?: string }[]; overallScore: number; recommendation: string };
  passed: boolean;
  durationMs: number;
}

interface CampaignResult {
  campaignId: string;
  markdown: string;
  campaign: any;
  swarmReview: SwarmReview | null;
  documentTitle: string;
  companyPersona: any;
}

type Stage = "input" | "building-persona" | "persona-ready" | "building-campaign" | "done";

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "in",
  twitter: "𝕏",
  reddit: "r/",
  instagram: "ig",
  substack: "ss",
  github: "gh",
};

const STAGE_STEPS = [
  { id: "input", label: "Input" },
  { id: "building-persona", label: "Learning company voice" },
  { id: "persona-ready", label: "Persona built" },
  { id: "building-campaign", label: "Generating campaign" },
  { id: "done", label: "Campaign ready" },
];

const DEMO_COMPANIES = [
  {
    name: "Gaia Dynamics",
    url: "https://gaiadynamics.ai",
    tag: "Trade Compliance AI",
    tagClass: "bg-cyan-500/20 text-cyan-400",
    description: "AI-powered tariff compliance — Andrew Ng backed",
  },
  {
    name: "Landing AI",
    url: "https://landing.ai",
    tag: "Manufacturing AI",
    tagClass: "bg-orange-500/20 text-orange-400",
    description: "Visual AI platform for industrial inspection",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? "text-emerald-400 bg-emerald-500/10" : score >= 6 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}/10</span>;
}

function RecommendationBadge({ rec }: { rec: string }) {
  const styles: Record<string, string> = {
    SHIP: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    REVISE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    HOLD: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${styles[rec] || styles.SHIP}`}>
      {rec}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CampaignGeneratorProps {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export default function CampaignGenerator({ isLoading, setIsLoading }: CampaignGeneratorProps) {
  const [stage, setStage] = useState<Stage>("input");
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [persona, setPersona] = useState<PersonaResult | null>(null);
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "plan" | "review">("content");
  const [progressMsg, setProgressMsg] = useState("");

  // ── Step 1: Ingest URL + build persona ──────────────────────────────────────

  async function handleBuildPersona() {
    if (!url.trim()) { setError("Enter a URL to get started."); return; }
    setError(null);
    setIsLoading(true);
    setStage("building-persona");

    try {
      // Ingest URL
      setProgressMsg("Reading the website...");
      const ingestRes = await fetch("/api/ingest-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) throw new Error(ingestData.error || "Failed to read URL");
      setDocumentId(ingestData.documentId);

      // Build persona
      setProgressMsg("Learning company voice and audience...");
      const personaRes = await fetch("/api/persona-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), companyName: companyName.trim() || undefined }),
      });
      const personaData = await personaRes.json();
      if (!personaRes.ok) throw new Error(personaData.error || "Failed to build persona");

      setPersona(personaData);
      setStage("persona-ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("input");
    } finally {
      setIsLoading(false);
      setProgressMsg("");
    }
  }

  // ── Step 2: Generate campaign ────────────────────────────────────────────────

  async function handleGenerateCampaign() {
    if (!documentId || !persona) return;
    setError(null);
    setIsLoading(true);
    setStage("building-campaign");
    setProgressMsg("Generating 5 platform assets + campaign plan... (swarm review runs in parallel)");

    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          personaId: persona.personaId,
          companyName: persona.companyName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign generation failed");

      setCampaignResult(data);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Campaign generation failed");
      setStage("persona-ready");
    } finally {
      setIsLoading(false);
      setProgressMsg("");
    }
  }

  // ── Download markdown ────────────────────────────────────────────────────────

  function handleDownload() {
    if (!campaignResult) return;
    const blob = new Blob([campaignResult.markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const slug = (campaignResult.documentTitle || "campaign").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
    a.download = `campaign-${new Date().toISOString().split("T")[0]}-${slug}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleReset() {
    setStage("input");
    setUrl("");
    setCompanyName("");
    setPersona(null);
    setCampaignResult(null);
    setDocumentId(null);
    setError(null);
  }

  // ── Stage indicator ──────────────────────────────────────────────────────────

  const stageIdx = STAGE_STEPS.findIndex((s) => s.id === stage);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Progress bar */}
      {stage !== "input" && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
          {STAGE_STEPS.filter(s => s.id !== "input").map((step, i) => {
            const done = stageIdx > i + 1;
            const active = stageIdx === i + 1;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 ${done ? "text-emerald-400" : active ? "text-indigo-400" : "text-zinc-600"}`}>
                  {done ? "✓" : active ? "▸" : "○"} {step.label}
                </span>
                {i < 3 && <span className="text-zinc-700">—</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && progressMsg && (
        <div className="flex items-center gap-3 justify-center py-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-zinc-400">{progressMsg}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* ── Stage: input ── */}
      {stage === "input" && (
        <div className="space-y-6">
          {/* Demo cards */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Try a demo company</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_COMPANIES.map((d) => (
                <button
                  key={d.url}
                  onClick={() => { setUrl(d.url); setCompanyName(d.name); }}
                  className="text-left rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-600 hover:bg-zinc-900 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-zinc-100 text-sm">{d.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.tagClass}`}>{d.tag}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{d.description}</p>
                  <p className="text-xs text-zinc-600 mt-1 truncate">{d.url}</p>
                </button>
              ))}
            </div>
          </div>

          {/* URL input */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Company website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleBuildPersona()}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Company name (optional)</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Auto-detected from URL"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleBuildPersona}
            disabled={isLoading || !url.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Learn company voice →
          </button>
        </div>
      )}

      {/* ── Stage: building-persona (loading) ── */}
      {stage === "building-persona" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Reading {url}</p>
            <p className="text-zinc-500 text-sm mt-1">Extracting company voice, audience, and distribution strategy...</p>
          </div>
        </div>
      )}

      {/* ── Stage: persona-ready ── */}
      {stage === "persona-ready" && persona && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-100">{persona.companyName}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{persona.domain}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Hub platform</p>
                <span className="text-sm font-bold text-indigo-400 uppercase">{persona.hubPlatform}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Voice</p>
                <p className="text-zinc-300">{persona.voice?.tone} · {persona.voice?.style}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Spokes</p>
                <div className="flex gap-1 flex-wrap">
                  {(persona.spokePlatforms || []).map((p) => (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {PLATFORM_ICONS[p] || p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {persona.audiencePersonas?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Target audiences</p>
                <div className="space-y-1.5">
                  {persona.audiencePersonas.slice(0, 3).map((ap) => (
                    <div key={ap.id} className="flex items-start gap-2 text-sm">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono shrink-0 mt-0.5">
                        {PLATFORM_ICONS[ap.primaryPlatform] || ap.primaryPlatform}
                      </span>
                      <div>
                        <span className="text-zinc-200 font-medium">{ap.name}</span>
                        {ap.description && <span className="text-zinc-500"> — {ap.description.slice(0, 80)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-500 italic">{persona.hubRationale}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl border border-zinc-700 py-3 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-all"
            >
              ← Start over
            </button>
            <button
              onClick={handleGenerateCampaign}
              disabled={isLoading}
              className="flex-[2] rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 transition-all"
            >
              Generate campaign →
            </button>
          </div>
        </div>
      )}

      {/* ── Stage: building-campaign (loading) ── */}
      {stage === "building-campaign" && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-zinc-200 font-medium">Generating campaign for {persona?.companyName}</p>
            <p className="text-zinc-500 text-sm mt-1">5 platform assets · campaign plan · swarm review</p>
            <div className="flex items-center gap-3 justify-center mt-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Claude generating content
              </span>
              <span>+</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Codex reviewing platform rules
              </span>
              <span>+</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Gemini scoring quality
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage: done ── */}
      {stage === "done" && campaignResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-100">{campaignResult.documentTitle}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{campaignResult.companyPersona?.companyName}</p>
            </div>
            <div className="flex items-center gap-2">
              {campaignResult.swarmReview && (
                <RecommendationBadge rec={campaignResult.swarmReview.recommendation} />
              )}
              <button
                onClick={handleDownload}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all"
              >
                ↓ Download .md
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-all"
              >
                New campaign
              </button>
            </div>
          </div>

          {/* Swarm review summary bar */}
          {campaignResult.swarmReview && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 flex flex-wrap items-center gap-4 text-xs">
              <span className="text-zinc-500 font-medium">Swarm Review</span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Codex: {campaignResult.swarmReview.codex.blockerCount} blockers, {campaignResult.swarmReview.codex.issues.length} total issues
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Gemini: {campaignResult.swarmReview.gemini.overallScore}/10
              </span>
              <span className="text-zinc-600">{campaignResult.swarmReview.durationMs}ms</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-800 pb-0">
            {(["content", "plan", "review"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "text-zinc-100 border-indigo-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                {tab === "review" ? `Swarm Review${campaignResult.swarmReview?.codex.blockerCount ? ` (${campaignResult.swarmReview.codex.blockerCount} issues)` : ""}` : tab === "content" ? "Platform Assets" : "Campaign Plan"}
              </button>
            ))}
          </div>

          {/* Tab: Platform Assets (from markdown) */}
          {activeTab === "content" && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{campaignResult.markdown.split("## Campaign Management Plan")[0]}</ReactMarkdown>
            </div>
          )}

          {/* Tab: Campaign Plan */}
          {activeTab === "plan" && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{`## Campaign Management Plan\n\n` + (campaignResult.markdown.split("## Campaign Management Plan")[1] || "").split("## Swarm Quality Review")[0]}</ReactMarkdown>
            </div>
          )}

          {/* Tab: Swarm Review */}
          {activeTab === "review" && (
            <div className="space-y-4">
              {!campaignResult.swarmReview ? (
                <p className="text-sm text-zinc-500">Swarm review was not available (Codex/Gemini CLIs not reachable from server).</p>
              ) : (
                <>
                  {/* Codex issues */}
                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100">Codex — Platform Rule Check</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${campaignResult.swarmReview.codex.blockerCount > 0 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {campaignResult.swarmReview.codex.blockerCount} blockers
                      </span>
                    </div>
                    {campaignResult.swarmReview.codex.issues.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-emerald-400">✅ No platform violations found</p>
                    ) : (
                      <ul className="divide-y divide-zinc-800">
                        {campaignResult.swarmReview.codex.issues.map((issue, i) => (
                          <li key={i} className="px-4 py-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                issue.severity === "BLOCKER" ? "bg-red-500/20 text-red-400" :
                                issue.severity === "WARNING" ? "bg-amber-500/20 text-amber-400" :
                                "bg-zinc-700 text-zinc-400"
                              }`}>{issue.severity}</span>
                              {issue.platform && <span className="text-xs text-zinc-500 font-mono">{issue.platform}</span>}
                            </div>
                            <p className="text-sm text-zinc-300">{issue.issue}</p>
                            {issue.fix && <p className="text-xs text-zinc-500">→ {issue.fix}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Gemini scores */}
                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-100">Gemini — Content Quality</span>
                      <ScoreBadge score={campaignResult.swarmReview.gemini.overallScore} />
                    </div>
                    <ul className="divide-y divide-zinc-800">
                      {campaignResult.swarmReview.gemini.dimensions.map((d, i) => (
                        <li key={i} className="px-4 py-3 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{d.dimension || d.section}</p>
                            {(d.note) && <p className="text-xs text-zinc-500 mt-0.5">{d.note}</p>}
                          </div>
                          <ScoreBadge score={d.score} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
