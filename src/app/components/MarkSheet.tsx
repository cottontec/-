"use client";

import { useState } from "react";

interface MarkSheetProps {
  /** 問題数 */
  questionCount: number;
  /** 選択肢の数（デフォルト4） */
  choiceCount?: number;
  /** 解答が変更されたとき */
  onAnswersChange?: (answers: Record<number, number>) => void;
  /** 採点結果（null=未採点） */
  results?: Record<number, boolean> | null;
  /** 正解データ（採点後に表示） */
  answerKey?: Record<number, number>;
  /** 読み取り専用 */
  readOnly?: boolean;
  /** 初期値 */
  initialAnswers?: Record<number, number>;
}

export default function MarkSheet({
  questionCount,
  choiceCount = 4,
  onAnswersChange,
  results = null,
  answerKey,
  readOnly = false,
  initialAnswers = {},
}: MarkSheetProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);

  const handleMark = (question: number, choice: number) => {
    if (readOnly) return;
    const newAnswers = { ...answers };
    if (newAnswers[question] === choice) {
      delete newAnswers[question]; // トグルで消す
    } else {
      newAnswers[question] = choice;
    }
    setAnswers(newAnswers);
    onAnswersChange?.(newAnswers);
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="rounded-lg border bg-white p-4">
      {/* ヘッダー */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">マークシート</h3>
        <span className="text-xs text-gray-500">
          {answeredCount}/{questionCount}
        </span>
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

          return (
            <div
              key={qNum}
              className={`flex items-center gap-0.5 rounded px-0.5 py-px ${
                results
                  ? isCorrect
                    ? "bg-green-50"
                    : "bg-red-50"
                  : qNum % 2 === 0
                    ? "bg-gray-50"
                    : ""
              }`}
            >
              {/* 問題番号 */}
              <div className="w-8 text-center text-xs font-medium text-gray-700">
                {qNum}
              </div>

              {/* マーク */}
              {Array.from({ length: choiceCount }, (_, cIdx) => {
                const choiceNum = cIdx + 1;
                const isSelected = selected === choiceNum;
                const isCorrectChoice = results && correctAnswer === choiceNum;

                let markClass = "";
                if (results) {
                  if (isSelected && isCorrect) {
                    markClass = "bg-green-600 text-white border-green-600"; // 正解
                  } else if (isSelected && !isCorrect) {
                    markClass = "bg-red-500 text-white border-red-500"; // 不正解
                  } else if (isCorrectChoice) {
                    markClass = "border-green-600 bg-green-100 text-green-700"; // 正解表示
                  } else {
                    markClass = "border-gray-300 text-gray-300";
                  }
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
                    className={`flex h-6 w-7 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold transition ${markClass} ${
                      readOnly ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    {isSelected ? choiceNum : "○"}
                  </button>
                );
              })}

              {/* 採点結果 */}
              {results && (
                <div className="ml-1 w-6 text-center text-sm">
                  {isCorrect ? "○" : "×"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* フッター統計 */}
      {results && (
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="text-sm text-gray-600">
            正解: {Object.values(results).filter(Boolean).length} / {questionCount}
          </div>
          <div className="text-lg font-bold text-blue-600">
            {Math.round(
              (Object.values(results).filter(Boolean).length / questionCount) * 100
            )}
            %
          </div>
        </div>
      )}
    </div>
  );
}
