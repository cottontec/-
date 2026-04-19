-- モード（通し/R/L/W）と大問別スコアを test_results に追加

ALTER TABLE test_results
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS section_scores JSONB;

-- exam_id を TEXT に変更（既存スキーマでは INTEGER だが、アプリ側は "pre2kyu-2019-3" のような文字列ID）
-- 既存データとの互換を取る必要がある場合は別途マイグレーションを書く
-- ALTER TABLE test_results ALTER COLUMN exam_id TYPE TEXT USING exam_id::text;
