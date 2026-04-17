"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, AlertTriangle, Pause, Play } from "lucide-react";

interface TimerProps {
  /** 残り時間モード: 制限分。指定なしならカウントアップ */
  limitMinutes?: number | null;
  /** 一時停止可能か */
  pausable?: boolean;
  /** 警告（残り○分で発火） */
  warnAtSeconds?: number;
  /** 自動提出時のコールバック（残り時間ゼロ） */
  onTimeUp?: () => void;
  /** 経過秒数を親に通知 */
  onTick?: (elapsedSeconds: number) => void;
  /** 開始済み（最初のアクションが起こったか） */
  active?: boolean;
}

const fmt = (sec: number) => {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function Timer({
  limitMinutes,
  pausable = true,
  warnAtSeconds = 300,
  onTimeUp,
  onTick,
  active = true,
}: TimerProps) {
  const [elapsed, setElapsed] = useState(0); // 秒
  const [paused, setPaused] = useState(false);
  const lastTickRef = useRef<number>(Date.now());
  const firedTimeUpRef = useRef(false);
  const beepedRef = useRef(false);

  useEffect(() => {
    if (!active || paused) {
      lastTickRef.current = Date.now();
      return;
    }
    const id = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta <= 0) return;
      lastTickRef.current = now;
      setElapsed((e) => {
        const next = e + delta;
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, paused, onTick]);

  const total = limitMinutes ? limitMinutes * 60 : null;
  const remaining = total !== null ? total - elapsed : null;

  // 残り時間切れ
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0 && !firedTimeUpRef.current) {
      firedTimeUpRef.current = true;
      onTimeUp?.();
    }
  }, [remaining, onTimeUp]);

  // 警告音（ブラウザのオーディオが許可されていれば）
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= warnAtSeconds && remaining > 0 && !beepedRef.current) {
      beepedRef.current = true;
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.05;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 200);
      } catch { /* オーディオ不可は無視 */ }
    }
  }, [remaining, warnAtSeconds]);

  const isWarning = remaining !== null && remaining <= warnAtSeconds;
  const isCritical = remaining !== null && remaining <= 60;
  const display = remaining !== null ? fmt(remaining) : fmt(elapsed);

  // プログレスバー（残り時間モード）
  const pct = total ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
      isCritical ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40 animate-pulse" :
      isWarning ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40" :
      "border-[var(--border)] bg-[var(--surface)]"
    }`}>
      {isWarning ? (
        <AlertTriangle size={16} className={isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"} />
      ) : (
        <Clock size={16} className="text-[var(--muted)]" />
      )}
      <div className="flex flex-col">
        <span className={`font-mono text-base font-bold tabular-nums ${
          isCritical ? "text-red-700 dark:text-red-300" :
          isWarning ? "text-amber-700 dark:text-amber-300" :
          "text-[var(--foreground)]"
        }`}>
          {display}
        </span>
        {total && (
          <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div
              className={`h-full transition-all ${isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
      {pausable && (
        <button
          onClick={() => setPaused((p) => !p)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          aria-label={paused ? "再開" : "一時停止"}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
}
