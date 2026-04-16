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
  /** 大問構成（ラップタイム記録用） */
  examSections?: ExamSection[];
  /** ラップタイムが記録されたとき */
  onLapTimesChange?: (lapTimes: LapTime[]) => void;
  /** 採点後に表示するラップタイム */
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

    // 初回マーク時にタイマー開始
    if (startTimeRef.current === 0) {
      startTimeRef.current = getTimestamp();
    }

    const newAnswers = { ...answers };
    if (newAnswers[question] === choice) {
      delete newAnswers[question];
    } else {
      newAnswers[question] = choice;
    }
    setAnswers(newAnswers);
    onAnswersChange?.(newAnswers);

    // ラップタイム記録: 大問の最後の問題がマークされたら
    if (examSections && newAnswers[question] !== undefined) {
      const sec = examSections.find((s) => s.endQ === question);
      if (sec && !recordedSectionsRef.current.has(sec.name)) {
        const now = getTimestamp();
        const elapsed = now - startTimeRef.current;
        const prevLap = lapTimesRef.current[lapTimesRef.current.length - 1];
        const duration = prevLap ? elapsed - prevLap.elapsedMs : elapsed;

        const newLap: LapTime = {
          sectionName: sec.name,
          startQ: sec.startQ,
          endQ: sec.endQ,
          elapsedMs: elapsed,
          durationMs: duration,
        };
        lapTimesRef.current = [...lapTimesRef.current, newLap];
        recordedSectionsRef.current.add(sec.name);
        onLapTimesChange?.(lapTimesRef.current);
      }
    }
  };

  const answeredCount = Object.keys(answers).length;

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // 大問の境界を判定
  const sectionEndQs = new Set(examSections?.map((s) => s.endQ) ?? []);
  const sectionStartMap = new Map(examSections?.map((s) => [s.startQ, s.name]) ?? []);

  return (
    <div className="rounded-lg border bg-white p-3">
      {/* ヘッダー */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">マークシート</h3>
        <span className="text-xs text-gray-500">{answeredCount}/{questionCount}</span>
      </div>

      {/* マークシート本体 */}
      <div className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto">
        {/* ヘッダー行 */}
        <div className="sticky top-0 z-10 flex items-center gap-0.5 bg-white pb-1">
          <div className="w-8 text-center text-[10px] font-medium text-gray-500">No.</div>
          {Array.from({ length: choiceCount }, (_, i) => (
            <div key={i} className="flex h-6 w-7 items-center justify-center text-[10px] font-bold text-gray-600">
              {i + 1}
            </div>
          ))}
          {results && (
            <div className="ml-1 w-6 text-center text-[10px] font-medium text-gray-500"></div>
          )}
        </div>

        {/* 各問題の行 */}
        {Array.from({ length: questionCount }, (_, qIdx) => {
          const qNum = qIdx + 1;
          const selected = answers[qNum];
          const isCorrect = results?.[qNum];
          const correctAnswer = answerKey?.[qNum];
          const sectionLabel = sectionStartMap.get(qNum);
          const isSectionEnd = sectionEndQs.has(qNum);

          return (
            <div key={qNum}>
              {/* 大問ラベル */}
              {sectionLabel && (
                <div className="mt-1 mb-0.5 px-1 text-[9px] font-bold text-blue-600 bg-blue-50 rounded py-0.5">
                  {sectionLabel}
                </div>
              )}
              <div
                className={`flex items-center gap-0.5 rounded px-0.5 py-px ${
                  results
                    ? isCorrect ? "bg-green-50" : "bg-red-50"
                    : qNum % 2 === 0 ? "bg-gray-50" : ""
                } ${isSectionEnd && !results ? "border-b border-blue-200 pb-1 mb-1" : ""}`}
              >
                <div className="w-8 text-center text-xs font-medium text-gray-700">{qNum}</div>
                {Array.from({ length: choiceCount }, (_, cIdx) => {
                  const choiceNum = cIdx + 1;
                  const isSelected = selected === choiceNum;
                  const isCorrectChoice = results && correctAnswer === choiceNum;

                  let markClass = "";
                  if (results) {
                    if (isSelected && isCorrect) markClass = "bg-green-600 text-white border-green-600";
                    else if (isSelected && !isCorrect) markClass = "bg-red-500 text-white border-red-500";
                    else if (isCorrectChoice) markClass = "border-green-600 bg-green-100 text-green-700";
                    else markClass = "border-gray-300 text-gray-300";
                  } else if (isSelected) {
                    markClass = "bg-gray-900 text-white border-gray-900";
                  } else {
                    markClass = "border-gray-300 text-gray-400 hover:border-gray-500 hover:bg-gray-100";
                  }

                  return (
                    <button
                      key={choiceNum}
                      onClick={() => handleMark(qNum, choiceNum)}
                      disabled={readOnly}
                      className={`flex h-6 w-7 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold transition ${markClass} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {isSelected ? choiceNum : "○"}
                    </button>
                  );
                })}
                {results && (
                  <div className="ml-1 w-6 text-center text-sm">{isCorrect ? "○" : "×"}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 採点結果 */}
      {results && (
        <div className="mt-3 flex items-center justify-between border-t pt-2">
          <div className="text-xs text-gray-600">
            正解: {Object.values(results).filter(Boolean).length}/{questionCount}
          </div>
          <div className="text-base font-bold text-blue-600">
            {Math.round((Object.values(results).filter(Boolean).length / questionCount) * 100)}%
          </div>
        </div>
      )}

      {/* ラップタイム表示 */}
      {displayLapTimes && displayLapTimes.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <h4 className="mb-1 text-xs font-bold text-gray-700">通過タイム</h4>
          <div className="space-y-0.5">
            {displayLapTimes.map((lap) => (
              <div key={lap.sectionName} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600 truncate max-w-[120px]">{lap.sectionName}</span>
                <div className="flex gap-2">
                  <span className="text-gray-500">{formatMs(lap.elapsedMs)}</span>
                  <span className="font-bold text-blue-600">({formatMs(lap.durationMs)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
