@AGENTS.md

# 英検過去問アプリ — Claude Code 引き継ぎドキュメント

## プロジェクト概要

英検（実用英語技能検定）の過去問をアプリ上で解いて、自動採点・成績管理・分析ができる学習アプリ。先生用ダッシュボードで生徒管理もできる。「共通テスト過去問演習テストジーニー」をイメージして作成。

## 技術スタック

- **Next.js 16.2.4** (App Router, Turbopack)
- **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase** (Auth + PostgreSQL + RLS) — 未接続でもlocalStorageフォールバックで動作
- **recharts 3** (成績グラフ)
- **lucide-react** (アイコン)

## セットアップ

```bash
npm install
npm run dev
# http://localhost:3000 で開く
```

### Supabase接続（任意）

1. Supabaseプロジェクトを作成
2. `supabase/schema.sql` をSQL Editorで実行
3. `.env.local` を編集:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## ファイル構成

```
src/app/
├── page.tsx                         # ホーム（級選択）
├── layout.tsx                       # ルートレイアウト（AuthProvider）
├── globals.css                      # グローバルスタイル
├── auth/
│   ├── page.tsx                     # ログイン/サインアップ
│   └── callback/route.ts           # OAuth コールバック
├── grade/[gradeId]/page.tsx         # 級詳細（試験一覧）
├── quiz/[examId]/page.tsx           # クイズ（問題解答）
├── result/[resultId]/page.tsx       # 結果表示
├── history/page.tsx                 # 解答履歴一覧
├── analytics/page.tsx               # 成績分析ダッシュボード
├── teacher/
│   ├── page.tsx                     # 先生ダッシュボード
│   └── class/[classId]/page.tsx     # クラス詳細（生徒・成績・課題）
├── admin/import/page.tsx            # CSV問題インポート
├── components/Header.tsx            # 共通ヘッダー
└── lib/
    ├── types.ts                     # 型定義
    ├── data.ts                      # サンプル問題データ（50問+）
    ├── storage.ts                   # データ保存（Supabase/localStorage）
    ├── teacher-storage.ts           # 先生用CRUD
    ├── auth-context.tsx             # 認証コンテキスト
    └── supabase/
        ├── client.ts                # ブラウザ用Supabaseクライアント
        ├── server.ts                # サーバー用Supabaseクライアント
        └── middleware.ts            # 認証ミドルウェア

middleware.ts.bak                    # ミドルウェア（要リネーム、下記参照）
supabase/
├── schema.sql                       # DBスキーマ（RLS付き）
└── migrations/001_initial_schema.sql
```

## 重要な設計ポイント

### デュアルストレージ
`storage.ts` と `teacher-storage.ts` は `isSupabaseConfigured()` でSupabaseの接続状態を確認し、未接続時はlocalStorageにフォールバックする。Supabase無しでもデモ動作可能。

### ミドルウェア注意点
`middleware.ts.bak` は元々 `middleware.ts` だったが、Supabase未設定時にブラウザから503エラーになる問題があったため一時的にリネームした。Supabase接続時は `middleware.ts` に戻すこと。

### 試験ID命名規則
`{grade}-{year}-{session}` 形式（例: `3kyu-2024-1`）。CSVインポート時にこのパターンから自動でメタデータを抽出する。

### サンプルデータ
`data.ts` に各級5問ずつのサンプル問題を収録（著作権に配慮した独自作成問題）。実際の英検過去問データは別途CSV等でインポートする想定。

## 現在の状態

### 完了済み
- 全12ページ実装済み
- 級選択 → 試験選択 → 問題解答 → 自動採点 → 結果表示の基本フロー
- 解答履歴の保存・表示
- 成績分析（級別平均・正答率・推移表示）
- 先生ダッシュボード（クラス作成・招待コード・生徒管理・課題管理）
- CSV一括インポート
- 認証（メール+パスワード、デモモード対応）
- Supabase RLSポリシー設定済み

### 未対応・改善点
1. **middleware.ts.bak → middleware.ts にリネーム必要**（Supabase接続後）
2. **実際の英検過去問データの投入**（著作権に注意）
3. **リスニング問題の音声再生機能**（現在はテキストのみ）
4. **ライティング問題の採点機能**（自由記述の自動採点）
5. **PWA対応**（Service Worker、オフライン対応）
6. **ネイティブアプリ化**（Capacitor）
7. **テストコードの追加**
8. **本番デプロイ**（Vercel推奨）

## 開発コマンド

```bash
npm run dev       # 開発サーバー (http://localhost:3000)
npm run build     # プロダクションビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック
```

## ビルド & デプロイ

```bash
# middleware.ts.bak を middleware.ts にリネームしてからビルド
mv middleware.ts.bak middleware.ts
npm run build
npm start
```

Vercelデプロイ時は環境変数にSupabaseの値を設定すること。
