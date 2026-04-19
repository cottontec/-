"use client";

import { useState, useEffect } from "react";
import { FileText, Maximize2, Minimize2, ExternalLink } from "lucide-react";

interface PdfViewerProps {
  src: string;
  title?: string;
}

export default function PdfViewer({ src, title }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(false);

  // Escapeキーで縮小
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden ${expanded ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <FileText size={16} className="text-red-500" />
          {title ?? "問題PDF"}
        </div>
        <div className="flex items-center gap-1">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            title="別タブで開く"
          >
            <ExternalLink size={12} />
            別タブ
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            title={expanded ? "縮小 (Esc)" : "拡大"}
            aria-label={expanded ? "PDFを縮小" : "PDFを拡大"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* PDF表示 */}
      <iframe
        src={src}
        className={`w-full border-0 ${expanded ? "h-[calc(100%-40px)]" : "h-[calc(100vh-180px)] min-h-[400px]"}`}
        title={title ?? "問題PDF"}
      />

      {/* 拡大時の背景オーバーレイ */}
      {expanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/50"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
