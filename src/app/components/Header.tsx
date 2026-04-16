"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { getUnreadCount } from "@/app/lib/storage";
import { LogOut, Home, History, BarChart3, GraduationCap, Bookmark, Bell, ScanLine } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      setUnreadCount(await getUnreadCount(user.id));
    };
    check();
    // 30秒ごとにチェック
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-gray-900">
          英検過去問演習
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <Home size={16} />
            <span className="hidden sm:inline">ホーム</span>
          </Link>
          {user && (
            <>
              <Link href="/scan" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <ScanLine size={16} />
                <span className="hidden sm:inline">紙採点</span>
              </Link>
              <Link href="/history" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <History size={16} />
                <span className="hidden sm:inline">履歴</span>
              </Link>
              <Link href="/analytics" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <BarChart3 size={16} />
                <span className="hidden sm:inline">分析</span>
              </Link>
              <Link href="/bookmarks" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <Bookmark size={16} />
                <span className="hidden sm:inline">保存</span>
              </Link>
              {/* 通知ベル */}
              <Link href="/notifications" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              {user.role === "teacher" && (
                <Link href="/teacher" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                  <GraduationCap size={16} />
                  <span className="hidden sm:inline">先生</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </>
          )}
          {!user && (
            <Link href="/auth" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
