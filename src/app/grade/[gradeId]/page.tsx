"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getExamsByGrade, isModeAvailable } from "@/app/lib/data";
import { GRADE_INFO, QUIZ_MODE_LABELS } from "@/app/lib/types";
import type { Grade, QuizMode } from "@/app/lib/types";
import { ArrowLeft, FileText, BookOpen, Headphones, PenSquare, Layers } from "lucide-react";

const MODE_ICONS: Record<QuizMode, React.ComponentType<{ size?: number; className?: string }>> = {
  full: Layers,
  reading: BookOpen,
  listening: Headphones,
  writing: PenSquare,
};

const MODE_STYLE: Record<QuizMode, string> = {
  full: "bg-blue-600 text-white hover:bg-blue-700",
  reading: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950/60 dark:text-green-200 dark:hover:bg-green-900",
  listening: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-200 dark:hover:bg-purple-900",
  writing: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900",
};

export default function GradePage() {
  const { gradeId } = useParams();
  const grade = gradeId as Grade;
  const info = GRADE_INFO[grade];
  const exams = getExamsByGrade(grade);

  // 新しい順に並べる（year desc, session desc）
  const sorted = [...exams].sort((a, b) => b.year - a.year || b.session - a.session);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> ホームに戻る
        </Link>

        <h2 className="mb-2 text-2xl font-bold text-[var(--foreground)]">{info?.label ?? grade} 過去問一覧</h2>
        <p className="mb-6 text-sm text-[var(--muted)]">
          試験ごとに「通し」か「R / L / W」から選んで学習できます
        </p>

        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((exam) => {
              const modes: QuizMode[] = ["full", "reading", "listening", "writing"];
              const availableModes = modes.filter((m) => isModeAvailable(exam, m));
              return (
                <div
                  key={exam.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <FileText size={18} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                    <div className="flex-1 min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-[var(--foreground)]">
                        {exam.title}
                        {exam.answerKey && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            自動採点
                          </span>
                        )}
                        {exam.hasWriting && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            作文あり
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {exam.questionCount}問
                        {exam.timeLimitMinutes ? ` / 目安 ${exam.timeLimitMinutes}分` : ""}
                        {exam.listeningStartQ ? ` / リスニングは問${exam.listeningStartQ}〜` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableModes.map((mode) => {
                      const Icon = MODE_ICONS[mode];
                      return (
                        <Link
                          key={mode}
                          href={`/quiz/${exam.id}?mode=${mode}`}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition active:scale-95 ${MODE_STYLE[mode]}`}
                        >
                          <Icon size={14} />
                          {QUIZ_MODE_LABELS[mode]}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-12 text-center">
            <FileText size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--foreground)]">この級の過去問は準備中です</p>
            <p className="mt-2 text-xs text-[var(--muted)]">追加され次第ご利用いただけます</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              他の級を見る
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
