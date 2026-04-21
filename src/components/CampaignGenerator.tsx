"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type CampaignStep = "input" | "persona" | "campaign";

interface PersonaResult {
  personaId: string;
  companyName: string;
  domain: string;
  hubPlatform: string;
  hubRationale: string;
  spokePlatforms: string[];
  audiencePersonas: { id: string; name: string; description: string }[];
  voice: { tone: string; style: string };
}

interface CampaignResult {
  campaignId: string;
  markdown: string;
  documentTitle: string;
  campaign: {
    campaignTitle: string;
    hubPlatform: string;
    keyAngles: { angle: string; why: string; targetPersona: string }[];
    platformAssets: Record<string, any>;
    publishingSchedule: any[];
  };
}

const LOADING_STEPS_PERSONA = [
  "Fetching company website...",
  "Analyzing brand voice...",
  "Identifying audience personas...",
  "Determining hub platform...",
];

const LOADING_STEPS_INGEST = [
  "Fetching content...",
  "Extracting structure with Claude...",
  "Building knowledge graph...",
];

const LOADING_STEPS_CAMPAIGN = [
  "Reading extracted content...",
  "Identifying top marketing angles...",
  "Writing LinkedIn post...",
  "Writing X thread...",
  "Writing Reddit post...",
  "Writing Instagram caption...",
  "Writing Substack lede...",
  "Building hub-and-spoke plan...",
  "Generating publishing schedule...",
];

function LoadingSteps({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="space-y-2 py-4">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 text-sm transition-all duration-300 ${
            i < active ? "text-emerald-400" : i === active ? "text-zinc-100" : "text-zinc-600"
          }`}
        >
          {i < active ? (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : i === active ? (
            <svg className="w-4 h-4 shrink-0 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
          )}
          {step}
        </div>
      ))}
    </div>
  );
}

export default function CampaignGenerator() {
  const [step, setStep] = useState<CampaignStep>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Input state
  const [companyUrl, setCompanyUrl] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Results state
  const [personaResult, setPersonaResult] = useState<PersonaResult | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

  // Animate through loading steps
  function animateSteps(steps: string[], intervalMs = 2000) {
    setLoadingSteps(steps);
    setLoadingStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i < steps.length) setLoadingStep(i);
      else clearInterval(timer);
    }, intervalMs);
    return timer;
  }

  async function handleBuildPersona() {
    if (!companyUrl.trim()) {
      setError("Please enter your company website URL.");
      return;
    }
    setError(null);
    setIsLoading(true);
    const timer = animateSteps(LOADING_STEPS_PERSONA, 2500);

    try {
      const res = await fetch("/api/persona-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: companyUrl.trim(),
          companyName: companyName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to build persona");
      clearInterval(timer);
      setPersonaResult(data);
      setStep("persona");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build company persona");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateCampaign() {
    if (!contentUrl.trim() && !personaResult) {
      setError("Please enter a content URL to generate a campaign from.");
      return;
    }
    setError(null);
    setIsLoading(true);

    let docId = documentId;

    // Ingest the content URL if not already done
    if (!docId && contentUrl.trim()) {
      const ingestTimer = animateSteps(LOADING_STEPS_INGEST, 1500);
      try {
        const res = await fetch("/api/ingest-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: contentUrl.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to ingest URL");
        clearInterval(ingestTimer);
        docId = data.documentId;
        setDocumentId(docId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch content URL");
        setIsLoading(false);
        return;
      }
    }

    if (!docId) {
      setError("No document to generate campaign from.");
      setIsLoading(false);
      return;
    }

    // Generate campaign
    const campaignTimer = animateSteps(LOADING_STEPS_CAMPAIGN, 1800);
    try {
      const res = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          personaId: personaResult?.personaId,
          companyName: personaResult?.companyName || companyName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate campaign");
      clearInterval(campaignTimer);
      setCampaignResult(data);
      setStep("campaign");
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate campaign");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownload() {
    if (!campaignResult) return;
    const blob = new Blob([campaignResult.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (campaignResult.campaign.campaignTitle || campaignResult.documentTitle || "campaign")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    a.download = `xteamos-campaign-${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setStep("input");
    setPersonaResult(null);
    setDocumentId(null);
    setCampaignResult(null);
    setError(null);
    setCompanyUrl("");
    setContentUrl("");
    setCompanyName("");
  }

  return (
    <div className="space-y-8">
      {step === "input" && (
        <div className="space-y-6 animate-fade-in">
          {/* Try with Gaia demo */}
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚡</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-300 mb-1">Try it live — Gaia Dynamics</p>
                <p className="text-xs text-zinc-400 mb-3">
                  Andrew Ng's AI Fund portfolio company. Real tariff compliance AI. Real campaign output.
                </p>
                <button
                  onClick={() => {
                    setCompanyUrl("https://gaiadynamics.ai");
                    setContentUrl("https://gaiadynamics.ai");
                    setCompanyName("Gaia Dynamics");
                  }}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                >
                  Pre-fill Gaia Dynamics →
                </button>
              </div>
            </div>
          </div>

          {/* Company URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Company Website
              <span className="ml-1.5 text-xs text-zinc-500">(we'll learn your voice from this)</span>
            </label>
            <input
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://gaiadynamics.ai"
              disabled={isLoading}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Company name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Company Name
              <span className="ml-1.5 text-xs text-zinc-500">(optional, auto-detected)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Gaia Dynamics"
              disabled={isLoading}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Content URL */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Content to Promote
              <span className="ml-1.5 text-xs text-zinc-500">(product page, announcement, blog post, doc)</span>
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://gaiadynamics.ai/tariff-engine"
              disabled={isLoading}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="glass-card rounded-2xl p-6">
              <LoadingSteps steps={loadingSteps} active={loadingStep} />
            </div>
          ) : (
            <button
              onClick={handleBuildPersona}
              disabled={!companyUrl.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
            >
              Build Company Persona →
            </button>
          )}
        </div>
      )}

      {step === "persona" && personaResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Persona summary card */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-zinc-100 text-lg">{personaResult.companyName}</h3>
                <p className="text-sm text-zinc-400 mt-0.5">{personaResult.domain}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Persona Ready
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Voice</p>
                <p className="text-sm text-zinc-200 font-medium">{personaResult.voice?.tone}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{personaResult.voice?.style}</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Hub Platform</p>
                <p className="text-sm text-zinc-200 font-medium capitalize">{personaResult.hubPlatform}</p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{personaResult.hubRationale}</p>
              </div>
            </div>

            {personaResult.audiencePersonas?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Audience Personas Detected</p>
                <div className="flex flex-wrap gap-2">
                  {personaResult.audiencePersonas.slice(0, 4).map((p) => (
                    <span key={p.id} className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content URL input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              What do you want to promote?
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://gaiadynamics.ai/tariff-engine"
              disabled={isLoading}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="glass-card rounded-2xl p-6">
              <LoadingSteps steps={loadingSteps} active={loadingStep} />
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => { setStep("input"); setError(null); }}
                className="px-5 py-3 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleGenerateCampaign}
                disabled={!contentUrl.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
              >
                Generate Campaign →
              </button>
            </div>
          )}
        </div>
      )}

      {step === "campaign" && campaignResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-zinc-100 text-xl">
                {campaignResult.campaign.campaignTitle || campaignResult.documentTitle}
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                {campaignResult.campaign.keyAngles?.length || 0} angles ·{" "}
                {Object.keys(campaignResult.campaign.platformAssets || {}).length} platform assets ·{" "}
                {campaignResult.campaign.publishingSchedule?.length || 0} scheduled posts
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .md
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all"
              >
                New Campaign
              </button>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            {(["preview", "raw"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeTab === tab
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === "preview" ? "Campaign Preview" : "Raw Markdown"}
              </button>
            ))}
          </div>

          {activeTab === "preview" ? (
            <div className="space-y-4">
              {/* Key angles */}
              {campaignResult.campaign.keyAngles?.length > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-3">Key Marketing Angles</h4>
                  <div className="space-y-3">
                    {campaignResult.campaign.keyAngles.map((a, i) => (
                      <div key={i} className="rounded-xl bg-zinc-900/60 p-3">
                        <p className="text-sm font-medium text-zinc-200">{a.angle}</p>
                        <p className="text-xs text-zinc-500 mt-1">{a.why}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                          → {a.targetPersona}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform assets preview */}
              {campaignResult.campaign.platformAssets && Object.entries(campaignResult.campaign.platformAssets).map(([platform, asset]: [string, any]) => (
                <div key={platform} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 uppercase tracking-wider">
                      {platform}
                    </span>
                    <span className="text-xs text-zinc-500">{asset.type}</span>
                  </div>
                  <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {platform === "twitter" && asset.tweets
                      ? asset.tweets.map((t: any) => (
                          <div key={t.n} className="mb-2 pb-2 border-b border-zinc-800 last:border-0">
                            <span className="text-xs text-zinc-500 mr-2">{t.n}.</span>{t.text}
                          </div>
                        ))
                      : platform === "instagram"
                      ? <>{asset.caption}<br /><br /><span className="text-zinc-500 text-xs">{asset.hashtags?.map((h: string) => `#${h}`).join(" ")}</span></>
                      : asset.hook
                      ? <><strong className="text-zinc-100">{asset.hook}</strong><br /><br />{asset.body}</>
                      : asset.lede || asset.body || JSON.stringify(asset, null, 2)
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 overflow-auto max-h-[70vh]">
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {campaignResult.markdown}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
