"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { getClassById, getClassMembers, getAssignments, createAssignment } from "@/app/lib/teacher-storage";
import { SAMPLE_EXAMS } from "@/app/lib/data";
import type { ClassRoom, ClassMember, Assignment } from "@/app/lib/types";
import { ArrowLeft, Users, BookOpen, Plus } from "lucide-react";

export default function ClassDetailPage() {
  const { classId } = useParams();
  const id = classId as string;
  const [cls, setCls] = useState<ClassRoom | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignExam, setAssignExam] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, m, a] = await Promise.all([getClassById(id), getClassMembers(id), getAssignments(id)]);
      setCls(c);
      setMembers(m);
      setAssignments(a);
      setLoading(false);
    })();
  }, [id]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignExam) return;
    const a = await createAssignment(id, assignExam, assignTitle.trim(), null);
    setAssignments((prev) => [a, ...prev]);
    setAssignTitle("");
    setAssignExam("");
    setShowAssign(false);
  };

  if (loading) return <div className="min-h-screen bg-[var(--background)]"><Header /><div className="flex items-center justify-center py-32 text-[var(--muted)]">読み込み中...</div></div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/teacher" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={16} /> クラス一覧に戻る
        </Link>

        <h2 className="mb-2 text-2xl font-bold text-[var(--foreground)]">{cls?.name ?? "クラス"}</h2>
        <div className="mb-6 flex items-center gap-4">
          <p className="text-sm text-[var(--muted)]">招待コード: <span className="font-mono font-bold">{cls?.inviteCode}</span></p>
          <Link href={`/teacher/class-report/${id}`} className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
            成績一覧表
          </Link>
        </div>

        {/* 生徒一覧 */}
        <section className="mb-8">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]"><Users size={18} /> 生徒一覧</h3>
          {members.length > 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y">
              {members.map((m) => (
                <Link key={m.studentId} href={`/teacher/student/${m.studentId}`} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--background)] transition">
                  <span className="text-sm text-[var(--foreground)]">{m.studentName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">{new Date(m.joinedAt).toLocaleDateString("ja-JP")}</span>
                    <span className="text-xs text-blue-600">詳細 →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">まだ生徒がいません。招待コードを共有してください。</p>
          )}
        </section>

        {/* 課題 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]"><BookOpen size={18} /> 課題</h3>
            <button onClick={() => setShowAssign(true)} className="flex items-center gap-1 rounded border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--background)]">
              <Plus size={14} /> 課題を追加
            </button>
          </div>

          {showAssign && (
            <form onSubmit={handleAssign} className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">課題タイトル</label>
                <input type="text" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">試験を選択</label>
                <select value={assignExam} onChange={(e) => setAssignExam(e.target.value)} className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm" required>
                  <option value="">選択してください</option>
                  {SAMPLE_EXAMS.map((ex) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">追加</button>
                <button type="button" onClick={() => setShowAssign(false)} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">キャンセル</button>
              </div>
            </form>
          )}

          {assignments.length > 0 ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] divide-y">
              {assignments.map((a) => (
                <div key={a.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">{a.title}</p>
                  <p className="text-xs text-[var(--muted)]">試験: {a.examId}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">まだ課題がありません。</p>
          )}
        </section>
      </main>
    </div>
  );
}
