"use client";

import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlaying(true);
  }, []);

  const changeSpeed = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    audio.playbackRate = next;
    setSpeed(next);
  }, [speed]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {title && (
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
          <Volume2 size={16} className="text-blue-500" />
          {title}
        </div>
      )}

      {/* プログレスバー */}
      <div
        className="mb-3 h-2 cursor-pointer rounded-full bg-[var(--surface-2)]"
        onClick={handleSeek}
      >
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* 時間表示 */}
        <span className="text-xs text-[var(--muted)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* コントロール */}
        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
            title="最初から"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            onClick={changeSpeed}
            className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]"
            title="再生速度"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
}
