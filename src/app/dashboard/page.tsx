import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { GRADES, GRADE_LABELS, GRADE_COLORS } from "@/lib/constants";
import type { UserProfile, TestResult, Exam } from "@/lib/database.types";
import { BookOpen, Trophy, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as UserProfile | null;

  // 直近のテスト結果を取得
  const { data: recentResults } = await supabase
    .from("test_results")
    .select("*, exams(*)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const typedResults = (recentResults ?? []) as (TestResult & { exams: Exam | null })[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* あいさつ */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {typedProfile?.display_name ?? "ゲスト"}さん、こんにちは
          </h2>
          <p className="mt-1 text-gray-600">級を選んで過去問に挑戦しましょう</p>
        </div>

        {/* 級選択カード */}
        <section className="mb-12">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">級を選択</h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {GRADES.map((grade) => (
              <Link
                key={grade}
                href={`/exams/${grade}`}
                className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-white ${GRADE_COLORS[grade]}`}
                >
                  <BookOpen size={24} />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  {GRADE_LABELS[grade]}
                </h4>
                <p className="mt-1 text-sm text-gray-500 group-hover:text-blue-600">
                  過去問を見る →
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 最近の成績 */}
        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">最近の学習</h3>
          {typedResults.length > 0 ? (
            <div className="space-y-3">
              {typedResults.map((result) => {
                const exam = result.exams;
                return (
                  <div
                    key={result.id}
                    className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy size={18} className="text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {exam
                            ? `${GRADE_LABELS[exam.grade] ?? exam.grade} ${exam.year}年 第${exam.session}回`
                            : "不明な試験"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(result.completed_at).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {result.percentage}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.score}/{result.total_points}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border bg-white py-12 text-center">
              <Clock size={48} className="mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">まだ学習履歴がありません</p>
              <p className="text-sm text-gray-400">
                上の級カードから過去問に挑戦してみましょう
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
