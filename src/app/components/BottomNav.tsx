"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import { tapLight } from "@/app/lib/haptics";
import { Home, History, BarChart3, RefreshCw, Bookmark } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: Home, match: (p: string) => p === "/" },
  { href: "/history", label: "履歴", icon: History, match: (p: string) => p.startsWith("/history") },
  { href: "/analytics", label: "分析", icon: BarChart3, match: (p: string) => p.startsWith("/analytics") },
  { href: "/drill", label: "弱点", icon: RefreshCw, match: (p: string) => p.startsWith("/drill") },
  { href: "/bookmarks", label: "保存", icon: Bookmark, match: (p: string) => p.startsWith("/bookmarks") },
];

export default function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname() ?? "/";

  // 未ログイン or クイズ中 は非表示
  if (!user) return null;
  if (pathname.startsWith("/quiz") || pathname.startsWith("/auth")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="メインナビゲーション"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                onClick={() => { if (!active) tapLight(); }}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] transition active:scale-95 ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
