"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { QuizResult, Grade } from "@/app/lib/types";
import { AlertTriangle, ArrowRight, RefreshCw, TrendingDown } from "lucide-react";

interface WeakArea {
  sectionName: string;
  avgPercentage: number;
  examCount: number;
  latestPercentage: number;
  examIds: string[]; // 再挑戦用
}

export default function DrillPage() {
  const { user } = useAuth();
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<{ examId: string; examTitle: string; questionIds: string[]; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const results = await getResults(user.id);

      // 大問ごとの弱点集計
      const sectionMap = new Map<string, { sum: number; count: number; latest: number; examIds: Set<string> }>();
      results.forEach((r) => {
        if (!r.sectionScores) return;
        r.sectionScores.forEach((ss) => {
          const cur = sectionMap.get(ss.name) ?? { sum: 0, count: 0, latest: 0, examIds: new Set() };
          cur.sum += ss.percentage;
          cur.count += 1;
          if (cur.count === 1) cur.latest = ss.percentage;
          cur.examIds.add(r.examId);
          sectionMap.set(ss.name, cur);
        });
      });

      const weak = Array.from(sectionMap.entries())
        .map(([name, data]) => ({
          sectionName: name,
          avgPercentage: Math.round(data.sum / data.count),
          examCount: data.count,
          latestPercentage: data.latest,
          examIds: Array.from(data.examIds),
        }))
        .filter((w) => w.avgPercentage < 70)
        .sort((a, b) => a.avgPercentage - b.avgPercentage);

      setWeakAreas(weak);

      // 間違えた問題の集計
      const wrongMap = new Map<string, Set<string>>();
      results.forEach((r) => {
        const wrong = r.answers.filter((a) => !a.isCorrect).map((a) => a.questionId);
        if (wrong.length > 0) {
          if (!wrongMap.has(r.examId)) wrongMap.set(r.examId, new Set());
          wrong.forEach((q) => wrongMap.get(r.examId)!.add(q));
        }
      });

      const wrongList = Array.from(wrongMap.entries())
        .map(([examId, qIds]) => {
          const exam = getExamById(examId);
          return {
            examId,
            examTitle: exam?.title ?? examId,
            questionIds: Array.from(qIds),
            count: qIds.size,
          };
        })
        .sort((a, b) => b.count - a.count);

      setWrongQuestions(wrongList);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          <RefreshCw size={24} className="inline mr-2 text-orange-600" /> 弱点克服ドリル
        </h2>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted)]">読み込み中...</div>
        ) : (
          <>
            {/* 弱点大問 */}
            <section className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
                <AlertTriangle size={18} className="text-red-500" /> 重点対策エリア
              </h3>
              {weakAreas.length > 0 ? (
                <div className="space-y-2">
                  {weakAreas.map((w) => (
                    <div key={w.sectionName} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{w.sectionName}</p>
                          <p className="text-xs text-[var(--muted)]">{w.examCount}回の試験で計測</p>
                        </div>
                        <span className="text-xl font-bold text-red-600">{w.avgPercentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface-2)] mb-2">
                        <div className="h-2 rounded-full bg-red-500" style={{ width: `${w.avgPercentage}%` }} />
                      </div>
                      {w.examIds[0] && (
                        <Link href={`/quiz/${w.examIds[0]}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <ArrowRight size={14} /> この分野を再挑戦
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-green-50 dark:bg-green-950/30 py-8 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium">弱点は見つかりませんでした！</p>
                  <p className="text-sm text-green-600 dark:text-green-400">すべての分野で70%以上です。素晴らしい！</p>
                </div>
              )}
            </section>

            {/* 間違えた問題 */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
                <TrendingDown size={18} className="text-yellow-600" /> 間違えた問題が多い試験
              </h3>
              {wrongQuestions.length > 0 ? (
                <div className="space-y-2">
                  {wrongQuestions.slice(0, 10).map((w) => (
                    <Link key={w.examId} href={`/quiz/${w.examId}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:bg-[var(--background)] transition">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{w.examTitle}</p>
                        <p className="text-xs text-red-500">{w.count}問不正解</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm text-blue-600">
                        再挑戦 <ArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-8 text-center text-[var(--muted)]">
                  まだデータがありません。過去問を解くと表示されます。
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
