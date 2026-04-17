"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { QuizResult, Grade } from "@/app/lib/types";
import { BarChart3 as BarChartIcon, TrendingUp, Target } from "lucide-react";

// recharts を動的インポート（SSR無効）
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const RadarChart = dynamic(() => import("recharts").then((m) => m.RadarChart), { ssr: false });
const Radar = dynamic(() => import("recharts").then((m) => m.Radar), { ssr: false });
const PolarGrid = dynamic(() => import("recharts").then((m) => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import("recharts").then((m) => m.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import("recharts").then((m) => m.PolarRadiusAxis), { ssr: false });

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
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">読み込み中...</div></div>;
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

  // 折れ線グラフ用データ（直近20件）
  const lineData = results.slice(0, 20).reverse().map((r, i) => {
    const exam = getExamById(r.examId);
    return {
      name: `#${i + 1}`,
      score: r.percentage,
      grade: exam ? GRADE_INFO[exam.grade as Grade]?.label : "?",
    };
  });

  // 棒グラフ用データ（級別平均）
  const barData = Array.from(gradeStats.entries()).map(([grade, stats]) => ({
    name: GRADE_INFO[grade as Grade]?.label ?? grade,
    average: Math.round(stats.total / stats.count),
    count: stats.count,
  }));

  // レーダーチャート用データ（セクション別 — 簡易版）
  const sectionStats = new Map<string, { correct: number; total: number }>();
  results.forEach((r) => {
    const exam = getExamById(r.examId);
    if (!exam) return;
    const section = exam.section;
    const cur = sectionStats.get(section) ?? { correct: 0, total: 0 };
    r.answers.forEach((a) => {
      cur.total += 1;
      if (a.isCorrect) cur.correct += 1;
    });
    sectionStats.set(section, cur);
  });

  const radarData = [
    { subject: "語彙", value: 0 },
    { subject: "文法", value: 0 },
    { subject: "読解", value: 0 },
    { subject: "リスニング", value: 0 },
  ];
  // 全体の正答率をベースにシミュレート
  const totalCorrect = results.reduce((sum, r) => sum + r.score, 0);
  const totalQ = results.reduce((sum, r) => sum + r.totalPoints, 0);
  const overallRate = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  if (totalQ > 0) {
    const readingStat = sectionStats.get("reading");
    const listeningStat = sectionStats.get("listening");
    radarData[0].value = overallRate; // 語彙
    radarData[1].value = overallRate; // 文法
    radarData[2].value = readingStat
      ? Math.round((readingStat.correct / readingStat.total) * 100)
      : overallRate; // 読解
    radarData[3].value = listeningStat
      ? Math.round((listeningStat.correct / listeningStat.total) * 100)
      : overallRate; // リスニング
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">成績分析</h2>

        {results.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-12 text-center">
            <BarChartIcon size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--muted)]">まだデータがありません</p>
            <p className="text-sm text-[var(--muted)]">過去問を解くと分析結果が表示されます</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <Target size={24} className="mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold text-blue-600">{overallRate}%</p>
                <p className="text-sm text-[var(--muted)]">全体正答率</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <BarChartIcon size={24} className="mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-green-600">{results.length}</p>
                <p className="text-sm text-[var(--muted)]">受験回数</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <TrendingUp size={24} className="mx-auto mb-2 text-purple-600" />
                <p className="text-3xl font-bold text-purple-600">{totalQ}</p>
                <p className="text-sm text-[var(--muted)]">解答数</p>
              </div>
            </div>

            {/* スコア推移（折れ線グラフ） */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">スコア推移</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} name="スコア (%)" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* 級別平均（棒グラフ） */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">級別平均スコア</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="average" fill="#10b981" name="平均スコア (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 分野別レーダーチャート */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">分野別正答率</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" fontSize={12} />
                      <PolarRadiusAxis domain={[0, 100]} fontSize={10} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="正答率 (%)" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
