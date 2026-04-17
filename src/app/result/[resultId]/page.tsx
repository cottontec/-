"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getResultById, addBookmark, removeBookmark, getBookmarks, type Bookmark } from "@/app/lib/storage";
import { useAuth } from "@/app/lib/auth-context";
import { getExamById, getQuestions } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { QuizResult, Question, Grade } from "@/app/lib/types";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, BookmarkPlus, BookmarkCheck } from "lucide-react";
import ShareButton from "@/app/components/ShareButton";
import ModeBadge from "@/app/components/ModeBadge";

export default function ResultPage() {
  const { resultId } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getResultById(resultId as string);
      if (r) {
        setResult(r);
        setQuestions(getQuestions(r.examId));
        const bms = await getBookmarks(user?.id);
        setBookmarkedIds(new Set(bms.map((b: Bookmark) => b.questionId)));
      }
      setLoading(false);
    })();
  }, [resultId, user]);

  const toggleBookmark = async (questionId: string, examId: string) => {
    if (!user) return;
    if (bookmarkedIds.has(questionId)) {
      await removeBookmark(user.id, questionId);
      setBookmarkedIds((prev) => { const s = new Set(prev); s.delete(questionId); return s; });
    } else {
      await addBookmark(user.id, { questionId, examId, note: "", createdAt: new Date().toISOString() });
      setBookmarkedIds((prev) => new Set(prev).add(questionId));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">読み込み中...</div></div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-[var(--muted)]">結果が見つかりませんでした</p>
          <Link href="/history" className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            履歴を見る
          </Link>
        </div>
      </div>
    );
  }

  const exam = getExamById(result.examId);
  const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label ?? exam.grade : "";

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}分${sec}秒`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> ホームに戻る
        </Link>

        {/* スコア */}
        <div className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <h2 className="text-lg text-[var(--muted)]">
              {gradeLabel} {exam ? `${exam.year}年 第${exam.session}回` : ""}
            </h2>
            <ModeBadge mode={result.mode ?? "full"} />
          </div>
          {result.mode === "writing" ? (
            <div className="mb-4">
              <p className="text-2xl font-bold text-[var(--foreground)]">ライティング提出済み</p>
              <p className="mt-2 text-sm text-[var(--muted)]">自動採点はありません。模範解答と比較しましょう。</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="text-6xl font-bold text-blue-600">{result.percentage}</span>
                <span className="text-2xl text-[var(--muted)]">%</span>
              </div>
              <p className="text-lg text-[var(--foreground)]">{result.score} / {result.totalPoints} 問正解</p>
            </>
          )}
          <p className="mt-2 text-sm text-[var(--muted)]">所要時間: {formatTime(result.timeSpentSeconds)}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-4">
            {exam && (
              <Link href={`/quiz/${exam.id}`} className="flex items-center gap-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]">
                <RotateCcw size={16} /> もう一度挑戦
              </Link>
            )}
            <Link href="/" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">ホームに戻る</Link>
            <ShareButton
              title={`英検${gradeLabel} 結果`}
              text={`英検${gradeLabel}で${result.percentage}%獲得！`}
              label="結果を共有"
            />
          </div>
        </div>

        {/* 正誤一覧 */}
        <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">問題ごとの結果</h3>
        <div className="space-y-3">
          {result.answers.map((answer) => {
            const question = questions.find((qq) => qq.id === answer.questionId);
            if (!question) return null;
            return (
              <div key={answer.questionId} className={`rounded-lg border p-4 ${
                answer.isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              }`}>
                <div className="flex items-start gap-3">
                  {answer.isCorrect
                    ? <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                    : <XCircle size={20} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)]">第{question.number}問</p>
                    <p className="mt-1 text-sm text-[var(--foreground)] break-words">{question.text}</p>
                    <div className="mt-2 text-sm text-[var(--foreground)]">
                      <p>あなたの解答: <span className={answer.isCorrect ? "font-medium text-green-700 dark:text-green-400" : "font-medium text-red-700 dark:text-red-400"}>{answer.selectedAnswer ?? "未回答"}</span></p>
                      {!answer.isCorrect && <p className="text-green-700 dark:text-green-400">正解: {question.correctAnswer}</p>}
                    </div>
                    {question.explanation && <p className="mt-2 text-sm text-[var(--muted)]">{question.explanation}</p>}
                    <button
                      onClick={() => toggleBookmark(question.id, result.examId)}
                      className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)] hover:text-yellow-600"
                    >
                      {bookmarkedIds.has(question.id) ? <BookmarkCheck size={14} className="text-yellow-500" /> : <BookmarkPlus size={14} />}
                      {bookmarkedIds.has(question.id) ? "ブックマーク済み" : "ブックマークする"}
                    </button>
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
