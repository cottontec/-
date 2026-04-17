"use client";

import { useState } from "react";
import { FileText, Maximize2, Minimize2, Download } from "lucide-react";

interface PdfViewerProps {
  src: string;
  title?: string;
}

export default function PdfViewer({ src, title }: PdfViewerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border bg-[var(--surface)] overflow-hidden ${expanded ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b bg-[var(--background)] px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <FileText size={16} className="text-red-500" />
          {title ?? "問題PDF"}
        </div>
        <div className="flex items-center gap-1">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)]"
            title="別タブで開く"
          >
            <Download size={14} />
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)]"
            title={expanded ? "縮小" : "拡大"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* PDF表示 */}
      <iframe
        src={src}
        className={`w-full border-0 ${expanded ? "h-[calc(100%-40px)]" : "h-[calc(100vh-180px)]"}`}
        title={title ?? "問題PDF"}
      />

      {/* 拡大時の背景オーバーレイ */}
      {expanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/50"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
