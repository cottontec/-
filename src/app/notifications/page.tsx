"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/lib/storage";
import type { AppNotification } from "@/app/lib/types";
import { Bell, CheckCheck, FileText, MessageSquare, ClipboardList, Info } from "lucide-react";

const ICONS: Record<string, typeof Bell> = {
  submission: FileText,
  counseling: MessageSquare,
  assignment: ClipboardList,
  general: Info,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setNotifications(await getNotifications(user.id));
      setLoading(false);
    })();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">お知らせ</h2>
          {notifications.some((n) => !n.read) && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <CheckCheck size={16} /> すべて既読にする
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`rounded-lg border p-4 transition ${n.read ? "bg-white" : "border-blue-200 bg-blue-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={18} className={n.read ? "text-gray-400" : "text-blue-600"} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${n.read ? "text-gray-700" : "text-gray-900"}`}>{n.title}</p>
                      <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {n.link && (
                          <Link href={n.link} className="text-xs text-blue-600 hover:underline">詳細を見る →</Link>
                        )}
                      </div>
                    </div>
                    {!n.read && <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">お知らせはまだありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
