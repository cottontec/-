"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { LogOut, Home, History, BarChart3, GraduationCap, Bookmark } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();

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
