import Link from "next/link";
import { BookOpen, BarChart3, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">英検過去問演習</h1>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              新規登録
            </Link>
          </div>
        </div>
      </header>

      {/* ヒーロー */}
      <main className="flex-1">
        <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-4xl font-bold text-gray-900">
              英検合格を目指すあなたへ
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              5級から1級まで、過去問をアプリ上で解答。
              自動採点と成績分析で効率的に学習できます。
            </p>
            <Link
              href="/auth/signup"
              className="mt-8 inline-block rounded-md bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
            >
              無料で始める
            </Link>
          </div>
        </section>

        {/* 特徴 */}
        <section className="py-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">過去問を解く</h3>
              <p className="mt-2 text-sm text-gray-600">
                5級〜1級の過去問をスマホやPCで手軽に解答できます
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <BarChart3 className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">成績を分析</h3>
              <p className="mt-2 text-sm text-gray-600">
                自動採点でスコア推移や弱点をグラフで可視化します
              </p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Users className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">クラス管理</h3>
              <p className="mt-2 text-sm text-gray-600">
                先生が生徒の進捗を一覧で確認し、課題を配信できます
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t bg-gray-50 py-8 text-center text-sm text-gray-500">
        英検過去問演習アプリ
      </footer>
    </div>
  );
}
