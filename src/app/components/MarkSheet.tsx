"use client";

import { useState, useRef, useCallback } from "react";
import type { ExamSection, LapTime } from "@/app/lib/types";

interface MarkSheetProps {
  questionCount: number;
  choiceCount?: number;
  onAnswersChange?: (answers: Record<number, number>) => void;
  results?: Record<number, boolean> | null;
  answerKey?: Record<number, number>;
  readOnly?: boolean;
  initialAnswers?: Record<number, number>;
  examSections?: ExamSection[];
  onLapTimesChange?: (lapTimes: LapTime[]) => void;
  lapTimes?: LapTime[];
}

export default function MarkSheet({
  questionCount,
  choiceCount = 4,
  onAnswersChange,
  results = null,
  answerKey,
  readOnly = false,
  initialAnswers = {},
  examSections,
  onLapTimesChange,
  lapTimes: displayLapTimes,
}: MarkSheetProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const startTimeRef = useRef(0);
  const lapTimesRef = useRef<LapTime[]>([]);
  const recordedSectionsRef = useRef<Set<string>>(new Set());

  const getTimestamp = useCallback(() => new Date().getTime(), []);

  const handleMark = (question: number, choice: number) => {
    if (readOnly) return;
    if (startTimeRef.current === 0) startTimeRef.current = getTimestamp();

    const newAnswers = { ...answers };
    if (newAnswers[question] === choice) {
      delete newAnswers[question];
    } else {
      newAnswers[question] = choice;
    }
    setAnswers(newAnswers);
    onAnswersChange?.(newAnswers);

    if (examSections && newAnswers[question] !== undefined) {
      const sec = examSections.find((s) => s.endQ === question);
      if (sec && !recordedSectionsRef.current.has(sec.name)) {
        const now = getTimestamp();
        const elapsed = now - startTimeRef.current;
        const prevLap = lapTimesRef.current[lapTimesRef.current.length - 1];
        const duration = prevLap ? elapsed - prevLap.elapsedMs : elapsed;
        const newLap: LapTime = { sectionName: sec.name, startQ: sec.startQ, endQ: sec.endQ, elapsedMs: elapsed, durationMs: duration };
        lapTimesRef.current = [...lapTimesRef.current, newLap];
        recordedSectionsRef.current.add(sec.name);
        onLapTimesChange?.(lapTimesRef.current);
      }
    }
  };

  const answeredCount = Object.keys(answers).length;
  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const sectionEndQs = new Set(examSections?.map((s) => s.endQ) ?? []);
  const sectionStartMap = new Map(examSections?.map((s) => [s.startQ, s.name]) ?? []);

  const correctCount = results ? Object.values(results).filter(Boolean).length : 0;
  const percentage = results ? Math.round((correctCount / questionCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">解答用紙</h3>
          <p className="text-[11px] text-slate-400">マークシート</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-slate-100 px-3 py-1">
            <span className="text-xs font-semibold text-slate-600">{answeredCount}<span className="text-slate-400">/{questionCount}</span></span>
          </div>
          {results && (
            <div className={`rounded-full px-3 py-1 ${percentage >= 70 ? "bg-emerald-100" : percentage >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
              <span className={`text-sm font-bold ${percentage >= 70 ? "text-emerald-700" : percentage >= 50 ? "text-amber-700" : "text-red-700"}`}>{percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* マークシート本体 */}
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-2 pdf-scroll">
        {/* ヘッダー行 */}
        <div className="sticky top-0 z-10 flex items-center gap-[3px] bg-white/95 backdrop-blur-sm pb-1.5 border-b border-slate-100 mb-1">
          <div className="w-9 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">No</div>
          {Array.from({ length: choiceCount }, (_, i) => (
            <div key={i} className="flex h-7 w-8 items-center justify-center text-[11px] font-bold text-slate-500">{i + 1}</div>
          ))}
          {results && <div className="ml-1 w-6" />}
        </div>

        {Array.from({ length: questionCount }, (_, qIdx) => {
          const qNum = qIdx + 1;
          const selected = answers[qNum];
          const isCorrect = results?.[qNum];
          const correctAnswer = answerKey?.[qNum];
          const sectionLabel = sectionStartMap.get(qNum);
          const isSectionEnd = sectionEndQs.has(qNum);

          return (
            <div key={qNum}>
              {sectionLabel && (
                <div className="mt-2 mb-1 flex items-center gap-2">
                  <div className="h-px flex-1 bg-blue-200" />
                  <span className="text-[9px] font-bold text-blue-600 whitespace-nowrap">{sectionLabel}</span>
                  <div className="h-px flex-1 bg-blue-200" />
                </div>
              )}
              <div className={`flex items-center gap-[3px] rounded-md px-1 py-[3px] transition-colors ${
                results
                  ? isCorrect ? "bg-emerald-50/60" : "bg-red-50/60"
                  : selected ? "bg-blue-50/40" : qNum % 2 === 0 ? "bg-slate-50/50" : ""
              }`}>
                <div className={`w-9 text-center text-[11px] font-semibold tabular-nums ${results ? (isCorrect ? "text-emerald-600" : "text-red-500") : "text-slate-500"}`}>
                  {qNum}
                </div>
                {Array.from({ length: choiceCount }, (_, cIdx) => {
                  const choiceNum = cIdx + 1;
                  const isSelected = selected === choiceNum;
                  const isCorrectChoice = results && correctAnswer === choiceNum;

                  let style = "";
                  if (results) {
                    if (isSelected && isCorrect) style = "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200";
                    else if (isSelected && !isCorrect) style = "bg-red-500 text-white border-red-500 shadow-sm shadow-red-200";
                    else if (isCorrectChoice) style = "border-emerald-400 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-300";
                    else style = "border-slate-200 text-slate-200";
                  } else if (isSelected) {
                    style = "bg-slate-800 text-white border-slate-800 shadow-sm";
                  } else {
                    style = "border-slate-250 text-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100";
                  }

                  return (
                    <button
                      key={choiceNum}
                      onClick={() => handleMark(qNum, choiceNum)}
                      disabled={readOnly}
                      className={`mark-fill flex h-7 w-8 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold ${style} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {isSelected ? choiceNum : ""}
                    </button>
                  );
                })}
                {results && (
                  <div className={`ml-1 w-6 text-center text-xs font-bold ${isCorrect ? "text-emerald-500" : "text-red-400"}`}>
                    {isCorrect ? "○" : "✕"}
                  </div>
                )}
              </div>
              {isSectionEnd && !results && <div className="my-1 h-px bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* フッター */}
      {results && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">正解 {correctCount}/{questionCount}</span>
            <span className={`text-lg font-bold ${percentage >= 70 ? "text-emerald-600" : percentage >= 50 ? "text-amber-600" : "text-red-600"}`}>{percentage}%</span>
          </div>
        </div>
      )}

      {/* ラップタイム */}
      {displayLapTimes && displayLapTimes.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <h4 className="mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">通過タイム</h4>
          <div className="space-y-1">
            {displayLapTimes.map((lap) => (
              <div key={lap.sectionName} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600 truncate max-w-[140px]">{lap.sectionName}</span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-400">{formatMs(lap.elapsedMs)}</span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-600">{formatMs(lap.durationMs)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
