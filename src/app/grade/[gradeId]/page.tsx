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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> ホームに戻る
        </Link>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">{info?.label ?? grade} 過去問一覧</h2>

        {grouped.size > 0 ? (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([key, sectionExams]) => {
              const first = sectionExams![0];
              return (
                <div key={key} className="rounded-lg border bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    {first.year}年 第{first.session}回
                  </h3>
                  <div className="space-y-2">
                    {sectionExams!.map((exam) => (
                      <Link
                        key={exam.id}
                        href={`/quiz/${exam.id}`}
                        className="flex items-center justify-between rounded-md border px-4 py-3 transition hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {SECTION_LABELS[exam.section] ?? exam.section}
                            </p>
                            <p className="text-sm text-gray-500">
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
          <div className="rounded-lg border bg-white py-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">この級の過去問はまだ登録されていません</p>
          </div>
        )}
      </main>
    </div>
  );
}
