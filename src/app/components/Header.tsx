"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-context";
import { useTheme } from "@/app/lib/theme-context";
import { getUnreadCount } from "@/app/lib/storage";
import {
  LogOut, Bell, GraduationCap, ChevronDown,
  Bookmark, ScanLine, Target, Calendar, RefreshCw, History, BarChart3,
  Sun, Moon, Monitor,
} from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const check = async () => setUnreadCount(await getUnreadCount(user.id));
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // 外クリックで閉じる
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const moreItems = [
    { href: "/scan", label: "紙採点", icon: ScanLine },
    { href: "/goals", label: "目標", icon: Target },
    { href: "/calendar", label: "学習日記", icon: Calendar },
    { href: "/bookmarks", label: "保存問題", icon: Bookmark },
  ];

  const ThemeIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">英</span>
          <span className="hidden sm:inline">英検過去問演習</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user && (
            <>
              {/* PC: 主要リンク3つだけ表に出す */}
              <Link href="/history" className="hidden md:flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                <History size={16} /> 履歴
              </Link>
              <Link href="/analytics" className="hidden md:flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                <BarChart3 size={16} /> 分析
              </Link>
              <Link href="/drill" className="hidden md:flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]">
                <RefreshCw size={16} /> 弱点
              </Link>

              {/* More メニュー */}
              <div className="relative hidden md:block" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                >
                  More <ChevronDown size={14} />
                </button>
                {moreOpen && (
                  <div className="fade-up absolute right-0 mt-1 w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                    {moreItems.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                      >
                        <Icon size={15} className="text-[var(--muted)]" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 通知 */}
              <Link
                href="/notifications"
                className="relative flex items-center rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                aria-label="通知"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* テーマ切替 */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen((v) => !v)}
              className="flex items-center rounded-md p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              aria-label="テーマ切替"
            >
              <ThemeIcon size={18} />
            </button>
            {themeOpen && (
              <div className="fade-up absolute right-0 mt-1 w-36 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                {([
                  ["light", "ライト", Sun],
                  ["dark", "ダーク", Moon],
                  ["system", "システム", Monitor],
                ] as const).map(([val, label, Icon]) => (
                  <button
                    key={val}
                    onClick={() => { setTheme(val); setThemeOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--surface-2)] ${
                      theme === val ? "text-blue-600 dark:text-blue-400 font-medium" : "text-[var(--foreground)]"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user?.role === "teacher" && (
            <Link
              href="/teacher"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            >
              <GraduationCap size={16} />
              <span className="hidden sm:inline">先生</span>
            </Link>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
              aria-label="ログアウト"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          ) : (
            <Link href="/auth" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
