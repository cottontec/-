"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResultsByUserId, getCounselingNotes, saveCounselingNote } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO, generateAutoAdvice } from "@/app/lib/types";
import type { QuizResult, CounselingNote, Grade } from "@/app/lib/types";
import { ArrowLeft, Clock, BarChart3, MessageSquare, Send, Bot } from "lucide-react";

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const sid = studentId as string;
  const { user } = useAuth();

  const [results, setResults] = useState<QuizResult[]>([]);
  const [notes, setNotes] = useState<CounselingNote[]>([]);
  const [comment, setComment] = useState("");
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [r, n] = await Promise.all([getResultsByUserId(sid), getCounselingNotes(sid)]);
      setResults(r);
      setNotes(n);
      setLoading(false);
    })();
  }, [sid]);

  const handleSendComment = async () => {
    if (!user || !comment.trim()) return;

    const exam = selectedResult ? getExamById(selectedResult.examId) : null;
    const grade = exam?.grade as Grade | undefined;
    const autoAdvice = selectedResult && grade
      ? generateAutoAdvice(selectedResult, grade)
      : "試験結果を選択すると自動アドバイスが生成されます。";

    const note: CounselingNote = {
      id: `cn-${new Date().getTime()}`,
      teacherId: user.id,
      studentId: sid,
      resultId: selectedResult?.id,
      autoAdvice,
      teacherComment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    await saveCounselingNote(note);
    setNotes((prev) => [note, ...prev]);
    setComment("");
  };

  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  if (!user || user.role !== "teacher") {
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">先生アカウントでログインしてください</div></div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">読み込み中...</div></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/teacher" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> クラス管理に戻る
        </Link>

        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">生徒詳細: {sid}</h2>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* 左: 成績一覧 */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
              <BarChart3 size={18} /> 受験履歴
            </h3>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((r) => {
                  const exam = getExamById(r.examId);
                  const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label : "?";
                  const isSelected = selectedResult?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResult(isSelected ? null : r)}
                      className={`w-full rounded-lg border p-3 text-left transition ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "bg-[var(--surface)] hover:bg-[var(--background)]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{gradeLabel} {exam?.title ?? r.examId}</p>
                          <p className="text-xs text-[var(--muted)]">{new Date(r.completedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${r.percentage >= 70 ? "text-green-600" : r.percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>{r.percentage}%</p>
                          <p className="text-xs text-[var(--muted)]">{r.score}/{r.totalPoints}</p>
                        </div>
                      </div>

                      {/* 大問ごとの正答率 */}
                      {isSelected && r.sectionScores && (
                        <div className="mt-3 border-t pt-2 space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)]">大問別正答率</p>
                          {r.sectionScores.map((ss) => (
                            <div key={ss.name} className="flex items-center justify-between text-xs">
                              <span className="text-[var(--muted)] truncate max-w-[180px]">{ss.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-[var(--surface-2)]">
                                  <div className={`h-1.5 rounded-full ${ss.percentage >= 70 ? "bg-green-500" : ss.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${ss.percentage}%` }} />
                                </div>
                                <span className="w-10 text-right font-bold">{ss.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ラップタイム */}
                      {isSelected && r.lapTimes && r.lapTimes.length > 0 && (
                        <div className="mt-3 border-t pt-2 space-y-1">
                          <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1"><Clock size={12} /> 通過タイム</p>
                          {r.lapTimes.map((lap) => (
                            <div key={lap.sectionName} className="flex items-center justify-between text-xs">
                              <span className="text-[var(--muted)] truncate max-w-[180px]">{lap.sectionName}</span>
                              <span className="font-mono text-blue-600">{formatMs(lap.durationMs)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between text-xs font-bold border-t pt-1">
                            <span>合計</span>
                            <span className="font-mono">{Math.floor(r.timeSpentSeconds / 60)}:{(r.timeSpentSeconds % 60).toString().padStart(2, "0")}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">まだ受験履歴がありません</p>
            )}
          </div>

          {/* 右: カウンセリング */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
              <MessageSquare size={18} /> カウンセリング
            </h3>

            {/* 自動アドバイスプレビュー */}
            {selectedResult && (
              <div className="mb-4 rounded-lg border border-[var(--border)] bg-amber-50 dark:bg-amber-950/40 p-3">
                <p className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300"><Bot size={12} /> 自動アドバイス</p>
                <p className="whitespace-pre-wrap text-xs text-[var(--foreground)]">
                  {generateAutoAdvice(selectedResult, (getExamById(selectedResult.examId)?.grade ?? "3kyu") as Grade)}
                </p>
              </div>
            )}

            {/* コメント入力 */}
            <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
              <p className="mb-2 text-xs font-bold text-[var(--foreground)]">先生からのコメント</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] px-2 py-1.5 text-sm"
                rows={3}
                placeholder={selectedResult ? "この結果についてアドバイスを書く..." : "試験結果を左から選択してください"}
              />
              <button
                onClick={handleSendComment}
                disabled={!comment.trim()}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={14} /> コメントを送信
              </button>
            </div>

            {/* 過去のカウンセリング */}
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs text-[var(--muted)]">{new Date(note.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  <div className="mt-1 rounded bg-amber-50 dark:bg-amber-950/40 p-2 text-xs text-[var(--foreground)]">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">自動アドバイス:</p>
                    <p className="whitespace-pre-wrap">{note.autoAdvice}</p>
                  </div>
                  <div className="mt-2 rounded bg-blue-50 dark:bg-blue-950/40 p-2 text-xs text-[var(--foreground)]">
                    <p className="font-bold text-blue-800 dark:text-blue-300 mb-1">先生のコメント:</p>
                    <p className="whitespace-pre-wrap">{note.teacherComment}</p>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p className="text-xs text-[var(--muted)]">まだカウンセリング記録がありません</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
