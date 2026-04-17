"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "eiken_pwa_dismiss";

export default function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 既にインストール済み (standalone mode) は表示しない
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const days = (Date.now() - parseInt(dismissed, 10)) / 86400000;
      if (days < 14) return; // 2週間は再表示しない
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show || !event) return null;

  const accept = async () => {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") setShow(false);
    setEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
    setEvent(null);
  };

  return (
    <div
      className="fade-up fixed bottom-20 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-blue-300 bg-blue-600 p-3 shadow-xl md:bottom-6"
      role="dialog"
      aria-label="アプリインストール"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
        <Download size={20} />
      </div>
      <div className="flex-1 text-white">
        <p className="text-sm font-bold">アプリをホーム画面に追加</p>
        <p className="text-xs text-blue-100">オフラインでも使えるようになります</p>
      </div>
      <button onClick={accept} className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">
        追加
      </button>
      <button onClick={dismiss} aria-label="閉じる" className="text-white/70 hover:text-white">
        <X size={18} />
      </button>
    </div>
  );
}
