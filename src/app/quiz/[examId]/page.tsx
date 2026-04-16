"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getQuestions, SAMPLE_EXAMS } from "@/app/lib/data";
import { saveResult } from "@/app/lib/storage";
import type { Question } from "@/app/lib/types";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";

export default function QuizPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = examId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const exam = SAMPLE_EXAMS.find((e) => e.id === id);

  useEffect(() => {
    setQuestions(getQuestions(id));
  }, [id]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId: string, label: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleSubmit = async () => {
    if (submitting || !user) return;
    setSubmitting(true);

    const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
    let score = 0;
    let totalPoints = 0;

    const userAnswers = questions.map((q) => {
      const selected = answers[q.id] ?? null;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += q.points;
      totalPoints += q.points;
      return { questionId: q.id, selectedAnswer: selected, isCorrect };
    });

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 10000) / 100 : 0;
    const resultId = `${id}-${Date.now()}`;

    await saveResult({
      id: resultId,
      examId: id,
      userId: user.id,
      answers: userAnswers,
      score,
      totalPoints,
      percentage,
      timeSpentSeconds: totalTimeSeconds,
      completedAt: new Date().toISOString(),
    });

    router.push(`/result/${resultId}`);
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32 text-gray-500">
          問題が見つかりませんでした
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* 進捗 */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>問題 {currentIndex + 1} / {totalQuestions}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> 回答済み: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
        </div>

        {/* 問題番号ドット */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id} onClick={() => setCurrentIndex(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                i === currentIndex ? "bg-blue-600 text-white"
                : answers[q.id] ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-600"
              }`}
            >
              {q.number}
            </button>
          ))}
        </div>

        {/* 問題 */}
        {currentQuestion && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-medium text-gray-500">第{currentQuestion.number}問</p>
            <p className="mb-6 whitespace-pre-wrap text-lg text-gray-900">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected = answers[currentQuestion.id] === choice.label;
                return (
                  <button
                    key={choice.label}
                    onClick={() => handleSelect(currentQuestion.id, choice.label)}
                    className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                      isSelected ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {choice.label}
                    </span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ナビ */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
          >
            <ArrowLeft size={16} /> 前の問題
          </button>
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              次の問題 <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={16} /> {submitting ? "送信中..." : "解答を提出"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
