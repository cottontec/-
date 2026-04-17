"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { QuizResult, Grade } from "@/app/lib/types";
import { ChevronLeft, ChevronRight, Calendar, Flame } from "lucide-react";

export default function CalendarPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      setResults(await getResults(user.id));
      setLoading(false);
    })();
  }, [user]);

  // 日付ごとの結果をマップ
  const dayMap = useMemo(() => {
    const map = new Map<string, QuizResult[]>();
    results.forEach((r) => {
      const day = new Date(r.completedAt).toISOString().split("T")[0];
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(r);
    });
    return map;
  }, [results]);

  // ストリーク計算
  const streak = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    const d = new Date(today);
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (dayMap.has(key)) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [dayMap]);

  // カレンダー生成
  const { year, month } = currentMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const prevMonth = () => {
    setCurrentMonth((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  };
  const nextMonth = () => {
    setCurrentMonth((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });
  };

  const monthTotal = results.filter((r) => {
    const d = new Date(r.completedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  const DAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          <Calendar size={24} className="inline mr-2 text-blue-600" /> 学習カレンダー
        </h2>

        {/* ストリーク・統計 */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <Flame size={24} className={`mx-auto mb-1 ${streak > 0 ? "text-orange-500" : "text-[var(--muted)]"}`} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{streak}</p>
            <p className="text-xs text-[var(--muted)]">連続学習日数</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{monthTotal}</p>
            <p className="text-xs text-[var(--muted)]">{MONTHS[month]}の受験回数</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{results.length}</p>
            <p className="text-xs text-[var(--muted)]">累計受験回数</p>
          </div>
        </div>

        {/* カレンダー */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-[var(--surface-2)]"><ChevronLeft size={20} /></button>
            <h3 className="text-lg font-bold text-[var(--foreground)]">{year}年 {MONTHS[month]}</h3>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-[var(--surface-2)]"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="py-1 text-center text-xs font-bold text-[var(--muted)]">{d}</div>
            ))}
            {weeks.flat().map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayResults = dayMap.get(dateStr);
              const hasStudy = !!dayResults;
              const today = new Date();
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              return (
                <div
                  key={i}
                  className={`relative flex flex-col items-center rounded-lg py-2 text-sm ${
                    isToday ? "ring-2 ring-blue-500" : ""
                  } ${hasStudy ? "bg-green-100" : "hover:bg-[var(--background)]"}`}
                >
                  <span className={`${hasStudy ? "font-bold text-green-800" : "text-[var(--foreground)]"}`}>{day}</span>
                  {dayResults && (
                    <div className="mt-0.5 flex gap-0.5">
                      {dayResults.slice(0, 3).map((r, j) => (
                        <div key={j} className={`h-1.5 w-1.5 rounded-full ${r.percentage >= 70 ? "bg-green-500" : r.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> 70%以上</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-yellow-500" /> 50-69%</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-red-500" /> 50%未満</span>
          </div>
        </div>
      </main>
    </div>
  );
}
