@AGENTS.md

# 英検過去問アプリ — Claude Code 引き継ぎドキュメント

## 運用方針（重要・絶対）

**お金がかかる機能・運用は採用しない。** 以下のような従量課金・月額課金が発生するものは
ユーザーの明示的な承認なしに導入・提案しない：

- 外部API（Claude / OpenAI / Gemini などのLLM API、翻訳API、TTS有料枠など）
- プッシュ通知のサーバー配信基盤（FCM無料枠内を超えるもの）
- メール配信サービス（SendGrid / Resend など従量課金）
- ストレージ従量課金（Supabase無料枠超過、S3 など）
- Vercel Pro / Supabase Pro 等の有料プラン前提の機能

ブラウザ内で完結する機能（Web Speech API、IndexedDB、localStorage、Service Worker、
Web Share API など）や、Supabase無料枠で収まる範囲は OK。迷ったら先にユーザーに確認する。

## プロジェクト概要

英検（実用英語技能検定）の過去問をアプリ上で解いて、自己採点・成績管理・分析ができる学習アプリ。
先生用ダッシュボードで生徒管理もできる。

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

## 過去問PDFの配置

`public/eiken/{gradeDir}/` にPDFを配置すると、自動で試験一覧に表示される。

**命名規則（準2級の例）:**

```
public/eiken/pre2kyu/
├── mondai-{year}-{session}.pdf   # 問題PDF（必須）
├── kotae-{year}-{session}.pdf    # 解答PDF（あれば個別参照、なければkaitou.pdfを使用）
├── kaitou.pdf                    # 汎用解答PDF
├── script-{year}-{session}.pdf   # リスニングスクリプト
└── listening-script.pdf          # 汎用スクリプト
```

他級 (`5kyu`/`4kyu`/`3kyu`/`2kyu`/`pre1kyu`/`1kyu`) も同じ構造で配置可能。
対応する `data.ts` の登録は新しい級を追加する際に必要。

### 自己採点モード

`answerKey` が未登録の試験は自動で「自己採点モード」で動作する：
- 解答は記録されるが自動採点されない
- 提出後に解答PDFへのリンクが強調表示される
- 履歴・分析では自動採点結果と分離して表示

正解データ（`answerKey`）が分かっていれば `data.ts` に `{1:2, 2:3, ...}` 形式で追記することで
自動採点モードに切り替わる。

## ファイル構成

```
src/
├── proxy.ts                        # Supabase認証プロキシ（Next.js 16: 旧middleware.ts）
├── app/
│   ├── page.tsx                    # ホーム（級選択・ダッシュボード）
│   ├── layout.tsx                  # ルートレイアウト
│   ├── globals.css
│   ├── offline/page.tsx            # オフラインフォールバック
│   ├── auth/
│   │   ├── page.tsx
│   │   └── callback/route.ts
│   ├── grade/[gradeId]/page.tsx    # 級詳細（試験一覧・モード選択）
│   ├── quiz/[examId]/page.tsx      # クイズ（mode=full/reading/listening/writing）
│   ├── result/[resultId]/page.tsx
│   ├── history/page.tsx
│   ├── analytics/page.tsx
│   ├── drill/page.tsx              # 弱点克服ドリル
│   ├── bookmarks/page.tsx
│   ├── teacher/
│   │   ├── page.tsx
│   │   ├── class/[classId]/page.tsx
│   │   ├── class-report/[classId]/page.tsx
│   │   ├── student/[studentId]/page.tsx
│   │   └── teaching-points/[examId]/page.tsx
│   ├── components/                 # Header, BottomNav, MarkSheet, PdfViewer, Timer, Toast, etc
│   └── lib/
│       ├── types.ts                # 型定義（Grade, Exam, QuizMode, QuizResult, etc）
│       ├── data.ts                 # 試験データ（PDFパスと大問構成）
│       ├── storage.ts              # データ保存（Supabase/localStorage）
│       ├── stats.ts                # 統計計算（streak, heatmap, avg）
│       ├── haptics.ts              # 触覚フィードバック
│       ├── theme-context.tsx       # light/dark/system テーマ
│       ├── auth-context.tsx
│       ├── teacher-storage.ts
│       └── supabase/
│
public/
├── eiken/{grade}/*.pdf             # 過去問PDF
├── sw.js                           # サービスワーカー
├── manifest.json                   # PWA manifest
├── icon-192.png / icon-512.png
└── ...
```

## 重要な設計ポイント

### デュアルストレージ
`storage.ts` と `teacher-storage.ts` は `isSupabaseConfigured()` でSupabaseの接続状態を確認し、
未接続時はlocalStorageにフォールバックする。Supabase無しでもデモ動作可能。

### クイズモード
- `full` 通し受験
- `reading` 筆記問題のみ（`listeningStartQ` 未満）
- `listening` リスニング問題のみ（`listeningStartQ` 以降、要設定）
- `writing` ライティング単独（`hasWriting: true` の試験のみ）

URL: `/quiz/{examId}?mode=reading` のように切替。

### 試験ID命名規則
`{grade}-{year}-{session}` 形式（例: `pre2kyu-2019-3`）。

### PWA
- `public/sw.js`: network-first (navigation) / stale-while-revalidate (static) / network-first with fallback (PDF)
- `public/manifest.json`: standalone, maskable icons, shortcuts 3種
- `src/app/components/PwaInstallPrompt.tsx`: 14日クールダウンで再表示

## 開発コマンド

```bash
npm run dev       # 開発サーバー
npm run build     # プロダクションビルド
npm run lint      # ESLint
npx tsc --noEmit  # 型チェック
```

## 現在の状態

### 登録済み過去問
- **準2級 9試験** (2014-2019): 自己採点モード
  - 自動採点対応は `answerKey` を `data.ts` に追加すれば有効化

### 未登録
- 5級/4級/3級/2級/準1級/1級 — PDFアップロード待ち

### 完了機能
- 級選択 → 試験選択 → 4モード選択 → 解答 → 提出 → 履歴の基本フロー
- PDFビューア・マークシート・ライティング入力・リスニングスクリプトPDFリンク
- 自動採点 / 自己採点 / ライティング提出の3モード
- 成績分析（level別平均・正答率推移・分野別レーダー）
- 先生ダッシュボード（クラス・生徒・課題・カウンセリング）
- 認証（メール+パスワード、デモモード対応、Supabase RLS対応）
- 4モード受験機能（通し/R/L/W）
- ブックマーク・弱点ドリル
- ダークモード/ライト/システム連動
- PWA（オフラインフォールバック、インストール、SW v2）
- 触覚フィードバック（prefers-reduced-motion尊重）
- モバイルBottomNav・タイマー（警告音・一時停止）

### 未対応・改善候補
- 他級の過去問PDF投入（著作権に注意）
- リスニング音源の統合（現状はPDFスクリプトのみ）
- ライティング自動採点（現状は模範解答比較のみ）
- プッシュ通知サーバー配信（コスト非採用）
- テストコード（Vitest/Playwright）
- 本番デプロイ（Vercel推奨）
