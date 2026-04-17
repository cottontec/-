"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO, SECTION_LABELS } from "@/app/lib/types";
import type { QuizResult, Grade } from "@/app/lib/types";
import { Trophy, Calendar } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getResults(user?.id);
      setResults(r);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">学習履歴</h2>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted)]">読み込み中...</div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => {
              const exam = getExamById(result.examId);
              const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label ?? exam.grade : "不明";
              return (
                <Link key={result.id} href={`/result/${result.id}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-yellow-500" />
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{exam ? `${gradeLabel} ${exam.year}年 第${exam.session}回` : "不明な試験"}</p>
                      <p className="text-sm text-[var(--muted)]">{exam ? (SECTION_LABELS[exam.section] ?? exam.section) : ""}</p>
                      <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                        <Calendar size={12} />
                        {new Date(result.completedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{result.percentage}%</p>
                    <p className="text-sm text-[var(--muted)]">{result.score}/{result.totalPoints}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-12 text-center">
            <Calendar size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--muted)]">まだ学習履歴がありません</p>
            <Link href="/" className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">過去問に挑戦する</Link>
          </div>
        )}
      </main>
    </div>
  );
}
