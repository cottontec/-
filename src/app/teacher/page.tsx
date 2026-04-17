"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getClasses, createClass } from "@/app/lib/teacher-storage";
import type { ClassRoom } from "@/app/lib/types";
import { Plus, Users, ClipboardCopy } from "lucide-react";

export default function TeacherPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setClasses(await getClasses(user.id));
      setLoading(false);
    })();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    const newClass = await createClass(newName.trim(), user.id);
    setClasses((prev) => [newClass, ...prev]);
    setNewName("");
    setShowCreate(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!user || user.role !== "teacher") {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="flex items-center justify-center py-32 text-[var(--muted)]">先生アカウントでログインしてください</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">クラス管理</h2>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            <Plus size={16} /> 新規クラス
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">クラス名</label>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 rounded-md border border-[var(--border)] px-3 py-2 text-sm" placeholder="例: 3年A組" required />
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">作成</button>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)]">キャンセル</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-12 text-center text-[var(--muted)]">読み込み中...</div>
        ) : classes.length > 0 ? (
          <div className="space-y-3">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/teacher/class/${cls.id}`} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-blue-500" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{cls.name}</p>
                    <p className="text-xs text-[var(--muted)]">{new Date(cls.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); copyCode(cls.inviteCode); }} className="flex items-center gap-1 rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--background)]">
                  <ClipboardCopy size={12} />
                  {copied === cls.inviteCode ? "コピー済み" : cls.inviteCode}
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-12 text-center">
            <Users size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--muted)]">まだクラスがありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
