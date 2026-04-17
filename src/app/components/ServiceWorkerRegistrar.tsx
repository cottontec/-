"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function ServiceWorkerRegistrar() {
  const [updateReady, setUpdateReady] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let mounted = true;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (!mounted) return;
        // 既に更新が待機中
        if (reg.waiting) setUpdateReady(reg);
        // 新しい更新を検知
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              if (mounted) setUpdateReady(reg);
            }
          });
        });
      })
      .catch(() => {});

    // 1時間ごとに更新チェック
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((r) => r?.update());
    }, 60 * 60 * 1000);

    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fade-up fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl md:bottom-6">
      <RefreshCw size={18} className="text-blue-600 dark:text-blue-400" />
      <p className="flex-1 text-sm text-[var(--foreground)]">新しいバージョンが利用できます</p>
      <button
        onClick={() => {
          updateReady.waiting?.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        }}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
      >
        更新
      </button>
    </div>
  );
}
