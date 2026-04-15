"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TerminologyChange {
  original: string;
  adapted: string;
  reason: string;
}

interface Rationale {
  kept: string[];
  simplified: string[];
  expanded: string[];
  cut: string[];
  terminologyChanges: TerminologyChange[];
  gaps?: string[];
}

interface ResultsViewProps {
  audienceName: string;
  formatName: string;
  adaptedContent: string;
  rationale: Rationale;
  reliability?: number;
  onReset: () => void;
  onNewAdaptation: () => void;
}

// ---------------------------------------------------------------------------
// Collapsible rationale section (Dark mode)
// ---------------------------------------------------------------------------

const SECTION_STYLES = {
  kept: { bg: "bg-emerald-500/10", badge: "bg-emerald-500/20 text-emerald-400", border: "border-emerald-500/20" },
  simplified: { bg: "bg-blue-500/10", badge: "bg-blue-500/20 text-blue-400", border: "border-blue-500/20" },
  expanded: { bg: "bg-violet-500/10", badge: "bg-violet-500/20 text-violet-400", border: "border-violet-500/20" },
  cut: { bg: "bg-red-500/10", badge: "bg-red-500/20 text-red-400", border: "border-red-500/20" },
  terminology: { bg: "bg-amber-500/10", badge: "bg-amber-500/20 text-amber-400", border: "border-amber-500/20" },
} as const;

function RationaleSection({
  title,
  items,
  styleKey,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  styleKey: keyof typeof SECTION_STYLES;
  defaultOpen?: boolean;
}) {
  const styles = SECTION_STYLES[styleKey];

  if (items.length === 0) return null;

  return (
    <div className={`rounded-xl border ${styles.border} overflow-hidden`}>
      <div className={`flex items-center justify-between px-4 py-3 ${styles.bg}`}>
        <span className="font-semibold text-zinc-100 text-sm">{title}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
          {items.length}
        </span>
      </div>
      <ul className="px-4 py-3 space-y-2 bg-zinc-900/30">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-zinc-300 flex gap-2 leading-relaxed">
            <span className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${styles.badge.split(' ')[0]}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TerminologySection({
  changes,
  defaultOpen = false,
}: {
  changes: TerminologyChange[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const styles = SECTION_STYLES.terminology;

  if (changes.length === 0) return null;

  return (
    <div className={`rounded-xl border ${styles.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 ${styles.bg} hover:opacity-80 transition-opacity`}
      >
        <span className="font-medium text-zinc-200">Terminology Changes</span>
        <span className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {changes.length}
          </span>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 bg-zinc-900/50">
          {changes.map((change, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center gap-2 font-medium text-zinc-200">
                <span className="line-through text-zinc-500">{change.original}</span>
                <span className="text-zinc-600">&rarr;</span>
                <span>{change.adapted}</span>
              </div>
              <p className="text-zinc-500 text-xs mt-0.5 ml-0.5">{change.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Tab = "content" | "rationale" | "terminology" | "gaps";

export default function ResultsView({
  audienceName,
  formatName,
  adaptedContent,
  rationale,
  reliability,
  onReset,
  onNewAdaptation,
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const termCount = rationale.terminologyChanges.length;
  const rationaleCount = rationale.kept.length + rationale.simplified.length + rationale.expanded.length + rationale.cut.length;

  const gapCount = rationale.gaps?.length ?? 0;

  const tabs: { id: Tab; label: string; count: number; color?: string }[] = [
    { id: "content", label: "Adapted Content", count: 0, color: "emerald" },
    { id: "rationale", label: "Rationale", count: rationaleCount, color: "blue" },
    { id: "terminology", label: "Terminology", count: termCount, color: "amber" },
    ...(gapCount > 0 ? [{ id: "gaps" as Tab, label: "Gaps to Fill", count: gapCount, color: "red" }] : []),
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">
            {audienceName}
            <span className="mx-2 text-zinc-700 font-normal">&middot;</span>
            <span className="font-medium text-zinc-400">{formatName}</span>
          </h1>
          <p className="text-sm mt-0.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              Adaptation complete
            </span>
            {reliability && (
              <span className={`flex items-center gap-1.5 font-semibold ${reliability >= 90 ? 'text-emerald-400' : reliability >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                Reliability: {reliability}%
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onNewAdaptation} className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-xl hover:bg-zinc-700 transition-colors">
            Different Audience
          </button>
          <button type="button" onClick={onReset} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
            New Document
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-zinc-900/80 rounded-xl border border-white/[0.06] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-indigo-500/20 text-indigo-300 shadow-sm shadow-indigo-500/10"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab.color === "red"
                  ? (activeTab === tab.id ? "bg-red-500/30 text-red-300" : "bg-red-500/20 text-red-400 animate-pulse")
                  : tab.color === "emerald"
                  ? (activeTab === tab.id ? "bg-emerald-500/30 text-emerald-300" : "bg-emerald-500/10 text-emerald-500")
                  : tab.color === "blue"
                  ? (activeTab === tab.id ? "bg-blue-500/30 text-blue-300" : "bg-blue-500/10 text-blue-500")
                  : tab.color === "amber"
                  ? (activeTab === tab.id ? "bg-amber-500/30 text-amber-300" : "bg-amber-500/10 text-amber-500")
                  : (activeTab === tab.id ? "bg-indigo-500/30 text-indigo-300" : "bg-zinc-800 text-zinc-500")
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "content" && (
        <div className="glass-panel rounded-2xl p-8 sm:p-10 animate-fade-in">
          <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-zinc-50 prose-headings:font-bold prose-headings:tracking-tight prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-li:leading-relaxed prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300 prose-blockquote:border-indigo-500/30 prose-blockquote:text-zinc-400 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-hr:border-white/[0.06]">
            <ReactMarkdown>{adaptedContent}</ReactMarkdown>
          </article>
        </div>
      )}

      {activeTab === "rationale" && (
        <div className="glass-panel rounded-2xl p-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RationaleSection title="Kept" items={rationale.kept} styleKey="kept" defaultOpen />
            <RationaleSection title="Simplified" items={rationale.simplified} styleKey="simplified" defaultOpen />
            <RationaleSection title="Expanded" items={rationale.expanded} styleKey="expanded" defaultOpen />
            <RationaleSection title="Cut" items={rationale.cut} styleKey="cut" defaultOpen />
          </div>
        </div>
      )}

      {activeTab === "terminology" && (
        <div className="glass-panel rounded-2xl p-8 animate-fade-in">
          <TerminologySection changes={rationale.terminologyChanges} defaultOpen />
        </div>
      )}

      {activeTab === "gaps" && rationale.gaps && (
        <div className="glass-panel rounded-2xl p-8 animate-fade-in border border-red-500/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse"></span>
            <p className="text-sm text-red-300 font-medium">This persona expects information the source document doesn't contain. Fill these gaps with real data — the system refuses to hallucinate.</p>
          </div>
          <div className="space-y-3">
            {rationale.gaps.map((gap, i) => (
              <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-zinc-200 leading-relaxed">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
