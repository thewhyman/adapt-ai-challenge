"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface FileUploadProps {
  onExtracted: (result: {
    documentId: string;
    title: string;
    documentType: string;
    sectionCount: number;
    conceptCount: number;
  }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function isAcceptedFile(file: File): boolean {
  const extensionMatch = ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );
  const mimeMatch = ACCEPTED_TYPES.includes(file.type);
  return extensionMatch || mimeMatch;
}

export default function FileUpload({ onExtracted, isLoading, setIsLoading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback((candidate: File) => {
    setError(null);

    if (!isAcceptedFile(candidate)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setError(`File exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    setFile(candidate);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const dropped = e.dataTransfer.files[0];
      if (dropped) validateAndSetFile(dropped);
    },
    [validateAndSetFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateAndSetFile(selected);
    },
    [validateAndSetFile]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response (status " + response.status + "):", text.substring(0, 500));
        if (response.status === 504 || response.status === 502) {
          setError(`Server timed out (${response.status}). Try a smaller file (under 10 pages).`);
        } else if (text.includes("FUNCTION_INVOCATION_TIMEOUT")) {
          setError("Function timed out. Try a smaller file (under 10 pages).");
        } else {
          setError(`Server error (${response.status}). Try a smaller file or incognito mode.`);
        }
        return;
      }

      if (!response.ok) {
        setError(data.error ?? `Extraction failed (${response.status})`);
        return;
      }

      onExtracted(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, onExtracted, setIsLoading]);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isLoading) inputRef.current?.click();
          }
        }}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed p-10 transition-all duration-300
          cursor-pointer select-none outline-none
          focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
          ${isDragOver
            ? "border-indigo-500/60 bg-indigo-500/10"
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900/80"
          }
          ${isLoading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload PDF or DOCX file"
        />

        {isLoading ? (
          <LoadingIndicator />
        ) : file ? (
          <SelectedFile name={file.name} onRemove={handleRemoveFile} />
        ) : (
          <DropZonePrompt />
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Submit button */}
      {file && !isLoading && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98]"
        >
          Extract Structure
        </button>
      )}
    </div>
  );
}

// ── Sub-components ──

function DropZonePrompt() {
  return (
    <>
      <UploadIcon />
      <p className="text-sm font-medium text-zinc-300">
        Drag and drop a file here, or click to browse
      </p>
      <p className="text-xs text-zinc-500">
        PDF or DOCX up to {MAX_FILE_SIZE_MB} MB
      </p>
    </>
  );
}

function SelectedFile({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <FileIcon />
      <span className="text-sm font-medium text-zinc-200 truncate max-w-xs">
        {name}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
        aria-label="Remove file"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function LoadingIndicator() {
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stages = [
    { label: "Parsing PDF", detail: "~2s", duration: 2000 },
    { label: "Extracting ontology via Claude Haiku", detail: "~10-15s", duration: 12000 },
    { label: "Storing knowledge graph in Neo4j", detail: "~3s", duration: 3000 },
    { label: "Done", detail: "", duration: 0 },
  ];

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    const t1 = setTimeout(() => setStage(1), 2000);
    const t2 = setTimeout(() => setStage(2), 15000);
    const t3 = setTimeout(() => setStage(3), 18000);
    return () => { clearInterval(timer); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <svg className="w-8 h-8 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div className="w-full space-y-2">
        {stages.slice(0, -1).map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              i < stage ? "bg-emerald-500/20 text-emerald-400" : i === stage ? "bg-indigo-500/20 text-indigo-400 animate-pulse" : "bg-zinc-800 text-zinc-600"
            }`}>
              {i < stage ? "✓" : i === stage ? "●" : "○"}
            </div>
            <span className={`${i <= stage ? "text-zinc-300" : "text-zinc-600"}`}>{s.label}</span>
            <span className="text-zinc-600 ml-auto">{s.detail}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-1">{elapsed}s · Running on Vercel free-tier infra</p>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-10 w-10 text-zinc-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.338 3.375 3.375 0 014.534 3.054A3.75 3.75 0 0118 19.5H6.75z"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="h-5 w-5 flex-shrink-0 text-zinc-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}
