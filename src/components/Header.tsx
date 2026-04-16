"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Home, History } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          英検過去問演習
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Home size={16} />
            ホーム
          </Link>
          <Link
            href="/history"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <History size={16} />
            履歴
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
