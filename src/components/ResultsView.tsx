"use client";

import { useState } from "react";

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
}

interface ResultsViewProps {
  audienceName: string;
  formatName: string;
  adaptedContent: string;
  rationale: Rationale;
  onReset: () => void;
  onNewAdaptation: () => void;
}

// ---------------------------------------------------------------------------
// Minimal markdown renderer — no external deps
// ---------------------------------------------------------------------------

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2 text-gray-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-gray-900">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 mb-1 list-disc list-inside">$1</li>')
    .replace(
      /(<li[^>]*>.*?<\/li>\n?)+/g,
      (match) => `<ul class="my-3 space-y-1">${match}</ul>`
    )
    .replace(
      /^(?!<[hul])((?!<).+)$/gm,
      '<p class="mb-3 leading-relaxed text-gray-700">$1</p>'
    );
}

// ---------------------------------------------------------------------------
// Collapsible rationale section
// ---------------------------------------------------------------------------

const SECTION_STYLES = {
  kept: { bg: "bg-green-50", badge: "bg-green-100 text-green-800", border: "border-green-200" },
  simplified: { bg: "bg-blue-50", badge: "bg-blue-100 text-blue-800", border: "border-blue-200" },
  expanded: { bg: "bg-purple-50", badge: "bg-purple-100 text-purple-800", border: "border-purple-200" },
  cut: { bg: "bg-red-50", badge: "bg-red-100 text-red-800", border: "border-red-200" },
  terminology: { bg: "bg-orange-50", badge: "bg-orange-100 text-orange-800", border: "border-orange-200" },
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
  const [open, setOpen] = useState(defaultOpen);
  const styles = SECTION_STYLES[styleKey];

  if (items.length === 0) return null;

  return (
    <div className={`rounded-lg border ${styles.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 ${styles.bg} hover:opacity-90 transition-opacity`}
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {items.length}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-2 bg-white">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-gray-400 select-none">&bull;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
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
    <div className={`rounded-lg border ${styles.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 ${styles.bg} hover:opacity-90 transition-opacity`}
      >
        <span className="font-medium text-gray-800">Terminology Changes</span>
        <span className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {changes.length}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 bg-white">
          {changes.map((change, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <span className="line-through text-gray-500">{change.original}</span>
                <span className="text-gray-400">&rarr;</span>
                <span>{change.adapted}</span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5 ml-0.5">{change.reason}</p>
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

export default function ResultsView({
  audienceName,
  formatName,
  adaptedContent,
  rationale,
  onReset,
  onNewAdaptation,
}: ResultsViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {audienceName}
              <span className="mx-2 text-gray-300 font-normal">&middot;</span>
              <span className="font-medium text-gray-600">{formatName}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Adaptation complete</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onNewAdaptation}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Different Audience
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              New Document
            </button>
          </div>
        </div>
      </header>

      {/* Two-panel layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Adapted content (2/3 width on desktop) */}
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-6">
                Adapted Content
              </h2>
              <article
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(adaptedContent) }}
              />
            </div>
          </section>

          {/* RIGHT: Rationale panel (1/3 width on desktop) */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Adaptation Rationale
              </h2>
              <div className="space-y-3">
                <RationaleSection
                  title="Kept"
                  items={rationale.kept}
                  styleKey="kept"
                  defaultOpen
                />
                <RationaleSection
                  title="Simplified"
                  items={rationale.simplified}
                  styleKey="simplified"
                />
                <RationaleSection
                  title="Expanded"
                  items={rationale.expanded}
                  styleKey="expanded"
                />
                <RationaleSection
                  title="Cut"
                  items={rationale.cut}
                  styleKey="cut"
                />
                <TerminologySection changes={rationale.terminologyChanges} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
