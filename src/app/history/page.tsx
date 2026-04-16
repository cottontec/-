import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { GRADE_LABELS, SECTION_LABELS } from "@/lib/constants";
import type { Grade, TestResult, Exam } from "@/lib/database.types";
import { Trophy, Calendar } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: results } = await supabase
    .from("test_results")
    .select("*, exams(*)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const typedResults = (results ?? []) as (TestResult & { exams: Exam | null })[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">学習履歴</h2>

        {typedResults.length > 0 ? (
          <div className="space-y-3">
            {typedResults.map((result) => {
              const exam = result.exams;
              const gradeLabel = exam
                ? GRADE_LABELS[exam.grade as Grade] ?? exam.grade
                : "不明";

              return (
                <Link
                  key={result.id}
                  href={
                    exam
                      ? `/exams/${exam.grade}/${exam.id}/result`
                      : "#"
                  }
                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-4 transition hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-yellow-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {exam
                          ? `${gradeLabel} ${exam.year}年 第${exam.session}回`
                          : "不明な試験"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {exam
                          ? SECTION_LABELS[exam.section] ?? exam.section
                          : ""}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} />
                        {new Date(result.completed_at).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {result.percentage}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {result.score}/{result.total_points}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">まだ学習履歴がありません</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              過去問に挑戦する
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
