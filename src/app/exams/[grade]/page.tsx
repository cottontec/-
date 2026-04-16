import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { GRADE_LABELS, SECTION_LABELS } from "@/lib/constants";
import type { Grade, Exam } from "@/lib/database.types";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";

interface Props {
  params: Promise<{ grade: string }>;
}

export default async function ExamListPage({ params }: Props) {
  const { grade } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const gradeLabel = GRADE_LABELS[grade as Grade] ?? grade;

  // この級の過去問一覧を取得
  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .eq("grade", grade)
    .order("year", { ascending: false })
    .order("session", { ascending: false });

  const typedExams = (exams ?? []) as Exam[];

  // ユーザーの完了済み試験を取得
  const { data: completedExams } = await supabase
    .from("test_results")
    .select("exam_id")
    .eq("user_id", user.id);

  const completedExamIds = new Set(
    (completedExams as { exam_id: number }[] | null)?.map((r) => r.exam_id) ?? []
  );

  // 年度・回ごとにグループ化
  const grouped = new Map<string, Exam[]>();
  typedExams.forEach((exam) => {
    const key = `${exam.year}-${exam.session}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(exam);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          ホームに戻る
        </Link>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {gradeLabel} 過去問一覧
        </h2>

        {grouped.size > 0 ? (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([key, sectionExams]) => {
              const first = sectionExams[0];
              return (
                <div key={key} className="rounded-lg border bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    {first.year}年 第{first.session}回
                  </h3>
                  <div className="space-y-2">
                    {sectionExams.map((exam) => {
                      const isCompleted = completedExamIds.has(exam.id);
                      return (
                        <Link
                          key={exam.id}
                          href={`/exams/${grade}/${exam.id}`}
                          className="flex items-center justify-between rounded-md border px-4 py-3 transition hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {SECTION_LABELS[exam.section] ?? exam.section}
                              </p>
                              <p className="text-sm text-gray-500">
                                {exam.total_questions}問
                                {exam.time_limit_minutes
                                  ? ` / ${exam.time_limit_minutes}分`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <CheckCircle
                              size={20}
                              className="text-green-500"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">
              この級の過去問はまだ登録されていません
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
