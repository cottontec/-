"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getTeachingPoint, saveTeachingPoint } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO, GRADE_SECTIONS } from "@/app/lib/types";
import type { TeachingPoint, Grade } from "@/app/lib/types";
import { ArrowLeft, GraduationCap, Save, Plus } from "lucide-react";

export default function TeachingPointsPage() {
  const { examId } = useParams();
  const id = examId as string;
  const { user } = useAuth();

  const exam = getExamById(id);
  const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label : "";
  const gradeSections = exam ? GRADE_SECTIONS[exam.grade] : [];

  const [teachingPoint, setTeachingPoint] = useState<TeachingPoint | null>(null);
  const [editing, setEditing] = useState(false);
  const [sections, setSections] = useState<TeachingPoint["sections"]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const tp = await getTeachingPoint(id);
      setTeachingPoint(tp);
      if (tp) {
        setSections(tp.sections);
      } else {
        // デフォルトで大問構成から空のセクションを作成
        setSections(gradeSections.map((gs) => ({
          name: gs.name,
          point: "",
          commonMistakes: "",
          advice: "",
        })));
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    const tp: TeachingPoint = {
      examId: id,
      sections,
      updatedAt: new Date().toISOString(),
    };
    await saveTeachingPoint(tp);
    setTeachingPoint(tp);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSection = (index: number, field: string, value: string) => {
    setSections((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  if (!user || user.role !== "teacher") {
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">先生アカウントでログインしてください</div></div>;
  }

  if (loading) {
    return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">読み込み中...</div></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/teacher" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> クラス管理に戻る
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              <GraduationCap size={24} className="inline mr-2 text-purple-600" />
              指導ポイント
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{gradeLabel} {exam?.title ?? id}</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-green-600">保存しました</span>}
            {editing ? (
              <button onClick={handleSave} className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                <Save size={16} /> 保存
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                <Plus size={16} /> 編集
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((sec, i) => (
            <div key={sec.name} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h3 className="mb-3 text-lg font-semibold text-[var(--foreground)]">{sec.name}</h3>

              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">指導のポイント</label>
                    <textarea value={sec.point} onChange={(e) => updateSection(i, "point", e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" rows={3} placeholder="この大問の指導ポイントを入力..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">よくある間違い</label>
                    <textarea value={sec.commonMistakes} onChange={(e) => updateSection(i, "commonMistakes", e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" rows={3} placeholder="生徒がよく間違えるパターン..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1">指導アドバイス</label>
                    <textarea value={sec.advice} onChange={(e) => updateSection(i, "advice", e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" rows={3} placeholder="どう指導すべきか..." />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {sec.point ? (
                    <>
                      <div className="rounded bg-purple-50 dark:bg-purple-950/40 p-3">
                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">指導のポイント</p>
                        <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{sec.point}</p>
                      </div>
                      {sec.commonMistakes && (
                        <div className="rounded bg-red-50 dark:bg-red-950/40 p-3">
                          <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">よくある間違い</p>
                          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{sec.commonMistakes}</p>
                        </div>
                      )}
                      {sec.advice && (
                        <div className="rounded bg-blue-50 dark:bg-blue-950/40 p-3">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">指導アドバイス</p>
                          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">{sec.advice}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">まだ指導ポイントが入力されていません。「編集」をクリックして入力してください。</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
