"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Square } from "lucide-react";

interface Props {
  text: string;
  lang?: string;
  rate?: number;
  className?: string;
  /** 表示ラベル（指定なしならアイコンのみ） */
  label?: string;
}

/** Web Speech API による英文の読み上げボタン。リスニング音源の代替に。 */
export default function SpeakButton({
  text, lang = "en-US", rate = 0.9, className = "", label,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  if (!supported) return null;

  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      onClick={speak}
      aria-label={speaking ? "停止" : "読み上げ"}
      title={speaking ? "停止" : "読み上げ（音源代替）"}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] ${className}`}
    >
      {speaking ? <Square size={12} /> : <Volume2 size={12} />}
      {label ?? (speaking ? "停止" : "読む")}
    </button>
  );
}
