"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useToast } from "@/app/components/Toast";
import { tapLight } from "@/app/lib/haptics";

interface Props {
  title: string;
  text: string;
  url?: string;
  className?: string;
  label?: string;
}

export default function ShareButton({ title, text, url, className = "", label = "共有" }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    tapLight();
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch { /* キャンセル時は何もしない */ }
    }
    // フォールバック: クリップボードへ
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      toast("リンクをコピーしました", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("共有に失敗しました", "error");
    }
  };

  return (
    <button
      onClick={share}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] ${className}`}
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {label}
    </button>
  );
}
