"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { GRADES, GRADE_INFO, type QuizResult, type Grade } from "@/app/lib/types";
import { getResults } from "@/app/lib/storage";
import {
  calcStreakDays, studySecondsInLastDays, averagePercentage,
  recentResults, formatStudyTime, mostFrequentGrade, buildActivityHeatmap,
} from "@/app/lib/stats";
import { SAMPLE_EXAMS } from "@/app/lib/data";
import {
  BookOpen, BarChart3, Users, Flame, Clock, Target, ChevronRight,
  TrendingUp, Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const data = await getResults(user.id);
      if (!cancelled) { setResults(data); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      {!user ? <Landing /> : <Dashboard results={results} loading={loading} userName={user.displayName} targetGrade={user.targetGrade as Grade | undefined} />}
    </div>
  );
}

function Landing() {
  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-blue-50 to-[var(--background)] dark:from-blue-950/30 py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-800 bg-white dark:bg-[var(--surface)] px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Sparkles size={12} /> 5級〜1級まで完全対応
          </span>
          <h1 className="mt-4 text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
            英検合格を、最短ルートで。
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            過去問をアプリで解答。自動採点・成績分析・弱点ドリルで効率的に学習できます。
          </p>
          <Link href="/auth" className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
            無料で始める
          </Link>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-3">
          {[
            { icon: BookOpen, bg: "bg-blue-100 dark:bg-blue-950", fg: "text-blue-600 dark:text-blue-400", title: "過去問を解く", desc: "5級〜1級の過去問をスマホやPCで手軽に解答" },
            { icon: BarChart3, bg: "bg-green-100 dark:bg-green-950", fg: "text-green-600 dark:text-green-400", title: "成績を分析", desc: "自動採点でスコア推移や弱点をグラフで可視化" },
            { icon: Users, bg: "bg-purple-100 dark:bg-purple-950", fg: "text-purple-600 dark:text-purple-400", title: "クラス管理", desc: "先生が生徒の進捗を一覧で確認・課題を配信" },
          ].map(({ icon: Icon, bg, fg, title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center card-hover">
              <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>
                <Icon className={fg} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Dashboard({
  results, loading, userName, targetGrade,
}: { results: QuizResult[]; loading: boolean; userName: string; targetGrade?: Grade }) {
  const streak = calcStreakDays(results);
  const weekSeconds = studySecondsInLastDays(results, 7);
  const avgPct = averagePercentage(results);
  const recent = recentResults(results, 3);
  const focusGrade = targetGrade ?? mostFrequentGrade(results) ?? "3kyu";
  const heatmap = buildActivityHeatmap(results, 84);

  // 続きから = 最後に挑んだ試験
  const continueExam = recent.length > 0 ? SAMPLE_EXAMS.find((e) => e.id === recent[0].examId) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">{userName}さん、こんにちは 👋</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">今日も一歩前進しましょう</p>
      </div>

      {/* KPI 4枚 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <KpiCard icon={Flame} accent="orange" label="連続学習" value={`${streak}日`} hint={streak >= 3 ? "🔥 絶好調" : "今日も続けよう"} />
        <KpiCard icon={Clock} accent="blue" label="今週の学習時間" value={formatStudyTime(weekSeconds)} hint={`${results.filter(r => Date.now() - new Date(r.completedAt).getTime() < 7*86400e3).length}回演習`} />
        <KpiCard icon={TrendingUp} accent="green" label="平均正答率" value={`${avgPct}%`} hint={results.length > 0 ? `通算 ${results.length}回` : "未受験"} />
        <KpiCard icon={Target} accent="purple" label="目標級" value={targetGrade ? GRADE_INFO[targetGrade].label : "未設定"} href="/goals" hint="設定→" />
      </div>

      {/* 続きから + おすすめ */}
      {!loading && (continueExam || recent.length > 0) && (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {continueExam && (
            <Link
              href={`/quiz/${continueExam.id}`}
              className="lg:col-span-2 group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <BookOpen size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-blue-100">続きから</p>
                <p className="mt-1 truncate text-lg font-bold">{continueExam.title}</p>
                <p className="mt-0.5 text-sm text-blue-100">前回の正答率 {recent[0]?.percentage}%</p>
              </div>
              <ChevronRight size={24} className="shrink-0 transition group-hover:translate-x-1" />
            </Link>
          )}
          <Link
            href="/drill"
            className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:bg-[var(--surface-2)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Sparkles size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">おすすめ</p>
              <p className="mt-0.5 font-bold text-[var(--foreground)]">弱点ドリルを始める</p>
              <p className="text-xs text-[var(--muted)]">苦手を集中攻略</p>
            </div>
            <ChevronRight size={20} className="text-[var(--muted)] transition group-hover:translate-x-1" />
          </Link>
        </div>
      )}

      {/* 学習カレンダー（ヒートマップ） */}
      {!loading && results.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">学習カレンダー（直近12週）</h3>
            <Link href="/calendar" className="text-xs text-blue-600 hover:underline dark:text-blue-400">詳細 →</Link>
          </div>
          <Heatmap data={heatmap} />
        </div>
      )}

      {/* 級選択 */}
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-base font-semibold text-[var(--foreground)]">級を選んで挑戦</h3>
        {focusGrade && (
          <Link href={`/grade/${focusGrade}`} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
            {GRADE_INFO[focusGrade].label}を続ける →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {GRADES.map((grade) => {
          const info = GRADE_INFO[grade];
          const isFocus = grade === focusGrade;
          return (
            <Link
              key={grade}
              href={`/grade/${grade}`}
              className={`group rounded-xl border bg-[var(--surface)] p-4 text-center card-hover ${
                isFocus ? "border-blue-500 ring-2 ring-blue-500/20" : "border-[var(--border)]"
              }`}
            >
              <div className={`mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-white ${info.bgColor}`}>
                <BookOpen size={18} />
              </div>
              <p className="font-bold text-[var(--foreground)]">{info.label}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function KpiCard({
  icon: Icon, accent, label, value, hint, href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: "orange" | "blue" | "green" | "purple";
  label: string; value: string; hint?: string; href?: string;
}) {
  const accentMap = {
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-950/40",
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    green: "text-green-500 bg-green-50 dark:bg-green-950/40",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  };
  const inner = (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:shadow-md">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accentMap[accent]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-[var(--foreground)]">{value}</p>
        {hint && <p className="text-[11px] text-[var(--muted)]">{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Heatmap({ data }: { data: { date: string; count: number }[] }) {
  // 7行×N列のグリッド（曜日を縦軸に）
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];
  data.forEach((d, i) => {
    currentWeek.push(d);
    if (currentWeek.length === 7 || i === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const intensity = (c: number) => {
    if (c === 0) return "bg-[var(--surface-2)]";
    if (c === 1) return "bg-blue-200 dark:bg-blue-900";
    if (c === 2) return "bg-blue-400 dark:bg-blue-700";
    return "bg-blue-600 dark:bg-blue-500";
  };

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((d) => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count}回`}
              className={`h-3 w-3 rounded-sm ${intensity(d.count)}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
