"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getBookmarks, removeBookmark, type Bookmark } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO } from "@/app/lib/types";
import type { Grade } from "@/app/lib/types";
import { BookmarkIcon, Trash2, ExternalLink } from "lucide-react";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const b = await getBookmarks(user?.id);
      setBookmarks(b);
      setLoading(false);
    })();
  }, [user]);

  const handleRemove = async (questionId: string) => {
    if (!user) return;
    await removeBookmark(user.id, questionId);
    setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">ブックマーク</h2>

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : bookmarks.length > 0 ? (
          <div className="space-y-3">
            {bookmarks.map((bm) => {
              const exam = getExamById(bm.examId);
              const gradeLabel = exam ? GRADE_INFO[exam.grade as Grade]?.label : "?";
              return (
                <div key={bm.questionId} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BookmarkIcon size={18} className="text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{gradeLabel} — {bm.questionId}</p>
                      {bm.note && <p className="text-xs text-gray-500">{bm.note}</p>}
                      <p className="text-xs text-gray-400">{new Date(bm.createdAt).toLocaleDateString("ja-JP")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exam && (
                      <Link href={`/quiz/${exam.id}`} className="rounded border p-1.5 text-gray-400 hover:text-blue-600">
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <button onClick={() => handleRemove(bm.questionId)} className="rounded border p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center">
            <BookmarkIcon size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">ブックマークはまだありません</p>
            <p className="text-sm text-gray-400">問題を解いた後、結果画面からブックマークできます</p>
          </div>
        )}
      </main>
    </div>
  );
}
