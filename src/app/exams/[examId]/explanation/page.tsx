"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getExplanation } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { ExamExplanation, Grade } from "@/app/lib/types";
import { ArrowLeft, BookOpen, FileQuestion } from "lucide-react";

export default function ExplanationPage() {
  const { examId } = useParams();
  const id = examId as string;
  const [explanation, setExplanation] = useState<ExamExplanation | null>(null);
  const [loading, setLoading] = useState(true);

  const exam = getExamById(id);
  const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label : "";

  useEffect(() => {
    (async () => {
      setExplanation(await getExplanation(id));
      setLoading(false);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href={exam ? `/grade/${exam.grade}` : "/"} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> 戻る
        </Link>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          <BookOpen size={24} className="inline mr-2 text-blue-600" />
          {gradeLabel} {exam?.title ?? id} — 解説
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {explanation ? `最終更新: ${new Date(explanation.updatedAt).toLocaleDateString("ja-JP")}` : ""}
        </p>

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : explanation && explanation.sections.length > 0 ? (
          <div className="space-y-6">
            {explanation.sections.map((sec) => (
              <div key={sec.name} className="rounded-lg border bg-white p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{sec.name}</h3>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{sec.questionRange}</span>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {sec.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-16 text-center">
            <FileQuestion size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">解説は準備中です</p>
            <p className="mt-1 text-sm text-gray-400">先生が解説コンテンツを追加すると、ここに表示されます</p>
          </div>
        )}
      </main>
    </div>
  );
}
