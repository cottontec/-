"use client";

import Link from "next/link";
import { WifiOff, Home, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-2)]">
        <WifiOff size={36} className="text-[var(--muted)]" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">オフラインです</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
        インターネット接続を確認してください。<br />
        過去に開いたページはキャッシュから閲覧できます。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} /> 再読み込み
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)]"
        >
          <Home size={16} /> ホームへ
        </Link>
      </div>
    </div>
  );
}
