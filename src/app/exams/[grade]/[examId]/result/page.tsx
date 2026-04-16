import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { GRADE_LABELS, SECTION_LABELS } from "@/lib/constants";
import type { Grade, Exam, TestResult, UserAnswer, Question, Choice } from "@/lib/database.types";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Props {
  params: Promise<{ grade: string; examId: string }>;
}

type AnswerWithQuestion = UserAnswer & {
  questions: (Question & { choices: Choice[] }) | null;
};

export default async function ResultPage({ params }: Props) {
  const { grade, examId } = await params;
  const examIdNum = Number(examId);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 最新のテスト結果を取得
  const { data: result } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_id", examIdNum)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  const typedResult = result as TestResult | null;

  // 試験情報を取得
  const { data: exam } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examIdNum)
    .single();

  const typedExam = exam as Exam | null;

  // 各問題の解答結果を取得
  const { data: userAnswers } = await supabase
    .from("user_answers")
    .select("*, questions(*, choices(*))")
    .eq("user_id", user.id)
    .eq("exam_id", examIdNum)
    .order("attempted_at", { ascending: false })
    .limit(typedExam?.total_questions ?? 100);

  const latestAnswers = (userAnswers ?? []) as AnswerWithQuestion[];

  const gradeLabel = GRADE_LABELS[grade as Grade] ?? grade;

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}分${sec}秒`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href={`/exams/${grade}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          {gradeLabel}の過去問一覧に戻る
        </Link>

        {typedResult && typedExam ? (
          <>
            {/* スコア表示 */}
            <div className="mb-8 rounded-lg border bg-white p-8 text-center shadow-sm">
              <h2 className="mb-2 text-lg text-gray-600">
                {gradeLabel} {typedExam.year}年 第{typedExam.session}回 -{" "}
                {SECTION_LABELS[typedExam.section] ?? typedExam.section}
              </h2>
              <div className="mb-4">
                <span className="text-6xl font-bold text-blue-600">
                  {typedResult.percentage}
                </span>
                <span className="text-2xl text-gray-500">%</span>
              </div>
              <p className="text-lg text-gray-700">
                {typedResult.score} / {typedResult.total_points} 問正解
              </p>
              <p className="mt-2 text-sm text-gray-500">
                所要時間: {formatTime(typedResult.time_spent_seconds)}
              </p>

              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href={`/exams/${grade}/${examId}`}
                  className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RotateCcw size={16} />
                  もう一度挑戦
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  ホームに戻る
                </Link>
              </div>
            </div>

            {/* 問題ごとの正誤一覧 */}
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              問題ごとの結果
            </h3>
            <div className="space-y-3">
              {latestAnswers.map((answer) => {
                const question = answer.questions;
                if (!question) return null;

                return (
                  <div
                    key={answer.id}
                    className={`rounded-lg border p-4 ${
                      answer.is_correct
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.is_correct ? (
                        <CheckCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-green-600"
                        />
                      ) : (
                        <XCircle
                          size={20}
                          className="mt-0.5 shrink-0 text-red-600"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          第{question.question_number}問
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {question.question_text}
                        </p>
                        <div className="mt-2 text-sm">
                          <p>
                            あなたの解答:{" "}
                            <span
                              className={
                                answer.is_correct
                                  ? "font-medium text-green-700"
                                  : "font-medium text-red-700"
                              }
                            >
                              {answer.selected_answer ?? "未回答"}
                            </span>
                          </p>
                          {!answer.is_correct && (
                            <p className="text-green-700">
                              正解: {question.correct_answer}
                            </p>
                          )}
                        </div>
                        {question.explanation && (
                          <p className="mt-2 text-sm text-gray-600">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center">
            <p className="text-gray-500">結果が見つかりませんでした</p>
          </div>
        )}
      </main>
    </div>
  );
}
