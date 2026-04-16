"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { QuizResult, Grade } from "@/app/lib/types";
import { BarChart3, TrendingUp, Target } from "lucide-react";

export default function AnalyticsPage() {
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

  if (loading) {
    return <div className="min-h-screen bg-gray-50"><Header /><div className="flex items-center justify-center py-32 text-gray-500">読み込み中...</div></div>;
  }

  // 級別の平均スコア
  const gradeStats = new Map<string, { total: number; count: number }>();
  results.forEach((r) => {
    const exam = getExamById(r.examId);
    if (!exam) return;
    const key = exam.grade;
    const cur = gradeStats.get(key) ?? { total: 0, count: 0 };
    cur.total += r.percentage;
    cur.count += 1;
    gradeStats.set(key, cur);
  });

  // 直近10件の推移
  const recent = results.slice(0, 10).reverse();

  // 弱点分析（正答率が低い問題タイプ）
  const typeStats = new Map<string, { correct: number; total: number }>();
  results.forEach((r) => {
    r.answers.forEach((a) => {
      // questionIdからexamIdを推定してタイプを取得（簡易版）
      const cur = typeStats.get("全体") ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (a.isCorrect) cur.correct += 1;
      typeStats.set("全体", cur);
    });
  });

  const overallCorrectRate = typeStats.has("全体")
    ? Math.round((typeStats.get("全体")!.correct / typeStats.get("全体")!.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">成績分析</h2>

        {results.length === 0 ? (
          <div className="rounded-lg border bg-white py-12 text-center">
            <BarChart3 size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">まだデータがありません</p>
            <p className="text-sm text-gray-400">過去問を解くと分析結果が表示されます</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 総合統計 */}
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">総合成績</h3>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{overallCorrectRate}%</p>
                <p className="text-sm text-gray-500">全体正答率</p>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>受験回数: {results.length}回</p>
                <p>解答数: {typeStats.get("全体")?.total ?? 0}問</p>
              </div>
            </div>

            {/* 級別成績 */}
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">級別平均</h3>
              </div>
              <div className="space-y-3">
                {Array.from(gradeStats.entries()).map(([grade, stats]) => {
                  const avg = Math.round(stats.total / stats.count);
                  const info = GRADE_INFO[grade as Grade];
                  return (
                    <div key={grade} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{info?.label ?? grade}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${avg}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{avg}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {gradeStats.size === 0 && <p className="text-sm text-gray-400">データなし</p>}
            </div>

            {/* スコア推移 */}
            <div className="rounded-lg border bg-white p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">最近の推移</h3>
              </div>
              <div className="space-y-2">
                {recent.map((r, i) => {
                  const exam = getExamById(r.examId);
                  return (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">#{i + 1} {exam ? GRADE_INFO[exam.grade as Grade]?.label : "?"}</span>
                      <span className={`font-bold ${r.percentage >= 70 ? "text-green-600" : r.percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {r.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
              {recent.length === 0 && <p className="text-sm text-gray-400">データなし</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
