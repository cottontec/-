"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getExamsByGrade } from "@/app/lib/data";
import { GRADE_INFO, SECTION_LABELS } from "@/app/lib/types";
import type { Grade } from "@/app/lib/types";
import { ArrowLeft, FileText } from "lucide-react";

export default function GradePage() {
  const { gradeId } = useParams();
  const grade = gradeId as Grade;
  const info = GRADE_INFO[grade];
  const exams = getExamsByGrade(grade);

  // グループ化: year-session
  const grouped = new Map<string, typeof exams>();
  exams.forEach((exam) => {
    const key = `${exam.year}-${exam.session}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(exam);
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> ホームに戻る
        </Link>

        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">{info?.label ?? grade} 過去問一覧</h2>

        {grouped.size > 0 ? (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([key, sectionExams]) => {
              const first = sectionExams![0];
              return (
                <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
                  <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">
                    {first.year}年 第{first.session}回
                  </h3>
                  <div className="space-y-2">
                    {sectionExams!.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/quiz/${exam.id}`}
                        className="flex items-center justify-between rounded-md border border-[var(--border)] px-4 py-3 transition hover:bg-[var(--background)]"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-[var(--muted)]" />
                          <div>
                            <p className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                              {SECTION_LABELS[exam.section] ?? exam.section}
                              {exam.answerKey && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">マークシート</span>
                              )}
                            </p>
                            <p className="text-sm text-[var(--muted)]">
                              {exam.questionCount}問
                              {exam.timeLimitMinutes ? ` / ${exam.timeLimitMinutes}分` : ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-12 text-center">
            <FileText size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--muted)]">この級の過去問はまだ登録されていません</p>
          </div>
        )}
      </main>
    </div>
  );
}
