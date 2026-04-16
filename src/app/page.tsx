"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { GRADES, GRADE_INFO } from "@/app/lib/types";
import { BookOpen, BarChart3, Users } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {!user ? (
        /* ランディング（未ログイン時） */
        <main className="flex-1">
          <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
            <div className="mx-auto max-w-3xl px-4">
              <h1 className="text-4xl font-bold text-gray-900">英検合格を目指すあなたへ</h1>
              <p className="mt-4 text-lg text-gray-600">
                5級から1級まで、過去問をアプリ上で解答。自動採点と成績分析で効率的に学習できます。
              </p>
              <Link href="/auth" className="mt-8 inline-block rounded-md bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700">
                無料で始める
              </Link>
            </div>
          </section>
          <section className="py-16">
            <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
              <div className="rounded-lg border p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">過去問を解く</h3>
                <p className="mt-2 text-sm text-gray-600">5級〜1級の過去問をスマホやPCで手軽に解答</p>
              </div>
              <div className="rounded-lg border p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <BarChart3 className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">成績を分析</h3>
                <p className="mt-2 text-sm text-gray-600">自動採点でスコア推移や弱点をグラフで可視化</p>
              </div>
              <div className="rounded-lg border p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Users className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">クラス管理</h3>
                <p className="mt-2 text-sm text-gray-600">先生が生徒の進捗を一覧で確認・課題を配信</p>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ホーム画面（ログイン済み） */
        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{user.displayName}さん、こんにちは</h2>
            <p className="mt-1 text-gray-600">級を選んで過去問に挑戦しましょう</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {GRADES.map((grade) => {
              const info = GRADE_INFO[grade];
              return (
                <Link
                  key={grade}
                  href={`/grade/${grade}`}
                  className="group rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-white ${info.bgColor}`}>
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{info.label}</h3>
                  <p className="mt-1 text-sm text-gray-500 group-hover:text-blue-600">過去問を見る →</p>
                </Link>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}
