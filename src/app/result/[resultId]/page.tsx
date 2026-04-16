"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getResultById } from "@/app/lib/storage";
import { getExamById, getQuestions } from "@/app/lib/data";
import { GRADE_INFO, SECTION_LABELS } from "@/app/lib/types";
import type { QuizResult, Question, Grade } from "@/app/lib/types";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";

export default function ResultPage() {
  const { resultId } = useParams();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getResultById(resultId as string);
      if (r) {
        setResult(r);
        setQuestions(getQuestions(r.examId));
      }
      setLoading(false);
    })();
  }, [resultId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50"><Header /><div className="flex items-center justify-center py-32 text-gray-500">読み込み中...</div></div>;
  }

  if (!result) {
    return <div className="min-h-screen bg-gray-50"><Header /><div className="flex items-center justify-center py-32 text-gray-500">結果が見つかりませんでした</div></div>;
  }

  const exam = getExamById(result.examId);
  const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label ?? exam.grade : "";

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}分${sec}秒`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> ホームに戻る
        </Link>

        {/* スコア */}
        <div className="mb-8 rounded-lg border bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-lg text-gray-600">
            {gradeLabel} {exam ? `${exam.year}年 第${exam.session}回` : ""} - {exam ? (SECTION_LABELS[exam.section] ?? exam.section) : ""}
          </h2>
          <div className="mb-4">
            <span className="text-6xl font-bold text-blue-600">{result.percentage}</span>
            <span className="text-2xl text-gray-500">%</span>
          </div>
          <p className="text-lg text-gray-700">{result.score} / {result.totalPoints} 問正解</p>
          <p className="mt-2 text-sm text-gray-500">所要時間: {formatTime(result.timeSpentSeconds)}</p>
          <div className="mt-6 flex justify-center gap-4">
            {exam && (
              <Link href={`/quiz/${exam.id}`} className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <RotateCcw size={16} /> もう一度挑戦
              </Link>
            )}
            <Link href="/" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">ホームに戻る</Link>
          </div>
        </div>

        {/* 正誤一覧 */}
        <h3 className="mb-4 text-lg font-semibold text-gray-900">問題ごとの結果</h3>
        <div className="space-y-3">
          {result.answers.map((answer) => {
            const question = questions.find((qq) => qq.id === answer.questionId);
            if (!question) return null;
            return (
              <div key={answer.questionId} className={`rounded-lg border p-4 ${answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" /> : <XCircle size={20} className="mt-0.5 shrink-0 text-red-600" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">第{question.number}問</p>
                    <p className="mt-1 text-sm text-gray-700">{question.text}</p>
                    <div className="mt-2 text-sm">
                      <p>あなたの解答: <span className={answer.isCorrect ? "font-medium text-green-700" : "font-medium text-red-700"}>{answer.selectedAnswer ?? "未回答"}</span></p>
                      {!answer.isCorrect && <p className="text-green-700">正解: {question.correctAnswer}</p>}
                    </div>
                    {question.explanation && <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
