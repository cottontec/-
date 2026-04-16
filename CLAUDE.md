# 英検過去問演習アプリ (eiken-app)

## プロジェクト概要
英検（5級〜1級）の過去問をアプリ上で解答でき、自動採点・成績の保存・推移分析ができる学習アプリ。

## 技術スタック
- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **BaaS**: Supabase (PostgreSQL + Auth + Storage)
- **グラフ**: recharts
- **アイコン**: lucide-react
- **デプロイ**: Vercel

## ディレクトリ構成
```
src/
├── app/
│   ├── page.tsx                          # ランディングページ
│   ├── layout.tsx                        # ルートレイアウト (lang="ja")
│   ├── globals.css                       # グローバルCSS
│   ├── auth/
│   │   ├── login/page.tsx                # ログイン画面
│   │   ├── signup/page.tsx               # 新規登録画面（生徒/先生選択付き）
│   │   └── callback/route.ts             # OAuth コールバック
│   ├── dashboard/page.tsx                # ホーム画面（級選択カード + 最近の学習）
│   ├── exams/
│   │   └── [grade]/
│   │       ├── page.tsx                  # 年度・回の一覧（完了バッジ付き）
│   │       └── [examId]/
│   │           ├── page.tsx              # 問題解答画面（選択肢タップ + ナビ）
│   │           └── result/page.tsx       # 結果画面（スコア + 正誤一覧 + 解説）
│   └── history/page.tsx                  # 学習履歴一覧
├── components/
│   └── Header.tsx                        # 共通ヘッダー（ナビ + ログアウト）
├── lib/
│   ├── constants.ts                      # 級名・色・セクション名の定数
│   ├── database.types.ts                 # DB テーブルの TypeScript 型定義
│   └── supabase/
│       ├── client.ts                     # ブラウザ用 Supabase クライアント
│       ├── server.ts                     # サーバー用 Supabase クライアント
│       └── middleware.ts                 # 認証セッション更新ミドルウェア
├── middleware.ts                         # Next.js ミドルウェア（認証ガード）
supabase/
└── migrations/
    └── 001_initial_schema.sql            # 全テーブル定義 + RLS ポリシー
```

## 主要テーブル
- `user_profiles` - ユーザー情報（role: student/teacher）
- `exams` - 過去問セット（級・年度・回・セクション）
- `questions` - 問題（問題文・正解・解説）
- `choices` - 選択肢
- `user_answers` - 各問題の解答記録
- `test_results` - テスト結果サマリー（スコア・正答率）
- `user_bookmarks` - ブックマーク
- `classes` / `class_members` / `assignments` - 先生向けクラス管理

## 開発コマンド
```bash
npm run dev       # 開発サーバー (http://localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック
```

## 環境変数
`.env.local` に以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase プロジェクト URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
```

## 設計上の注意点
- **認証**: Supabase Auth + `@supabase/ssr` によるクッキーベースセッション管理。未ログインユーザーは `/auth/login` にリダイレクト（`/` と `/auth/*` は除外）
- **RLS**: 全テーブルで Row Level Security を有効化。exams/questions/choices は全ユーザー読み取り可、user_* テーブルは自分のデータのみアクセス可
- **型安全性**: `database.types.ts` にアプリ用の型を定義。Supabase クエリ結果は `as` でキャストして使用。将来的に `supabase gen types typescript` で自動生成に移行可能
- **級の識別子**: `5kyu`, `4kyu`, `3kyu`, `pre2kyu`, `2kyu`, `pre1kyu`, `1kyu`

## Phase 1 (MVP) - 完了済み
- [x] Next.js + Tailwind + Supabase セットアップ
- [x] 認証（ログイン/サインアップ/ログアウト）
- [x] ダッシュボード（級選択 + 最近の学習）
- [x] 過去問一覧（年度・回・セクション別）
- [x] 問題解答画面（選択肢タップ + 問題ナビゲーション）
- [x] 自動採点 + 結果画面（スコア・正誤一覧・解説）
- [x] 学習履歴ページ
- [x] SQL マイグレーション + RLS ポリシー

## 次のステップ
1. Supabase プロジェクト作成 → `.env.local` 設定 → マイグレーション実行
2. サンプル過去問データの投入（3級1年分から）
3. スコア推移グラフ（recharts）
4. 分野別正答率・弱点分析
5. ブックマーク機能
6. リスニング音声再生
7. PWA 対応
8. 先生向けダッシュボード
9. CSV インポート機能
