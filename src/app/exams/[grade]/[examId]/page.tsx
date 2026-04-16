"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import type { Exam, Question, Choice } from "@/lib/database.types";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";

type QuestionWithChoices = Question & { choices: Choice[] };

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = Number(params.examId);
  const grade = params.grade as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: examData } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (!examData) {
        router.push(`/exams/${grade}`);
        return;
      }

      setExam(examData as Exam);

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*, choices(*)")
        .eq("exam_id", examId)
        .order("sort_order");

      if (questionsData) {
        const sorted = (questionsData as QuestionWithChoices[]).map((q) => ({
          ...q,
          choices: q.choices.sort((a, b) => a.sort_order - b.sort_order),
        }));
        setQuestions(sorted);
      }

      setLoading(false);
    };

    fetchData();
  }, [examId, grade, router]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId: number, choiceLabel: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceLabel }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);

    // 各問題の解答を保存
    let score = 0;
    let totalPoints = 0;

    const answerRows = questions.map((q) => {
      const selected = answers[q.id] ?? null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) score += q.points;
      totalPoints += q.points;

      return {
        user_id: user.id,
        exam_id: examId,
        question_id: q.id,
        selected_answer: selected,
        is_correct: isCorrect,
      };
    });

    await supabase.from("user_answers").insert(answerRows);

    const percentage =
      totalPoints > 0
        ? Math.round((score / totalPoints) * 10000) / 100
        : 0;

    await supabase.from("test_results").insert({
      user_id: user.id,
      exam_id: examId,
      score,
      total_points: totalPoints,
      percentage,
      time_spent_seconds: totalTimeSeconds,
    });

    router.push(`/exams/${grade}/${examId}/result`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-gray-500">問題が見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* 進捗バー */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            問題 {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            回答済み: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* 問題番号ドット */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                i === currentIndex
                  ? "bg-blue-600 text-white"
                  : answers[q.id]
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {q.question_number}
            </button>
          ))}
        </div>

        {/* 問題 */}
        {currentQuestion && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-medium text-gray-500">
              第{currentQuestion.question_number}問
            </p>
            <p className="mb-6 whitespace-pre-wrap text-lg text-gray-900">
              {currentQuestion.question_text}
            </p>

            {/* 選択肢 */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected =
                  answers[currentQuestion.id] === choice.choice_label;
                return (
                  <button
                    key={choice.id}
                    onClick={() =>
                      handleSelect(currentQuestion.id, choice.choice_label)
                    }
                    className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {choice.choice_label}
                    </span>
                    <span>{choice.choice_text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
          >
            <ArrowLeft size={16} />
            前の問題
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
              }
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              次の問題
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={16} />
              {submitting ? "送信中..." : "解答を提出"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
