"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import type { UserRole } from "@/app/lib/types";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName, role);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">英検過去問演習</h1>
          <p className="mt-2 text-[var(--muted)]">
            {mode === "login" ? "ログインして学習を始めましょう" : "新規アカウントを作成"}
          </p>
        </div>

        {/* タブ */}
        <div className="flex rounded-lg bg-[var(--surface-2)] p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-[var(--surface)] shadow text-[var(--foreground)]" : "text-[var(--muted)]"
            }`}
          >
            ログイン
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "signup" ? "bg-[var(--surface)] shadow text-[var(--foreground)]" : "text-[var(--muted)]"
            }`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-[var(--surface)] p-8 shadow">
          {error && <div className="rounded-md bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">表示名</label>
              <input
                type="text" required value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-[var(--border)] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="名前を入力"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">メールアドレス</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[var(--border)] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">パスワード</label>
            <input
              type="password" required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-[var(--border)] px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="6文字以上"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">アカウントの種類</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="student" checked={role === "student"} onChange={() => setRole("student")} />
                  <span className="text-sm">生徒</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="teacher" checked={role === "teacher"} onChange={() => setRole("teacher")} />
                  <span className="text-sm">先生・講師</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "新規登録"}
          </button>
        </form>
      </div>
    </div>
  );
}
