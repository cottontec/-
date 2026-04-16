-- 英検過去問演習アプリ 初期スキーマ

-- ユーザープロフィール（Supabase Auth と連携）
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  target_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 過去問セット
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  grade TEXT NOT NULL,
  year INTEGER NOT NULL,
  session INTEGER NOT NULL,
  section TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grade, year, session, section)
);

-- 問題
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  audio_url TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  sort_order INTEGER NOT NULL
);

-- 選択肢
CREATE TABLE choices (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  choice_label TEXT NOT NULL,
  choice_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

-- 解答記録
CREATE TABLE user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- テスト結果サマリー
CREATE TABLE test_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ブックマーク
CREATE TABLE user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- クラス
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- クラスメンバー
CREATE TABLE class_members (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 課題
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX idx_user_answers_exam_id ON user_answers(exam_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_choices_question_id ON choices(question_id);
CREATE INDEX idx_class_members_class_id ON class_members(class_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);

-- RLS (Row Level Security) ポリシー
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- exams, questions, choices は全ユーザー読み取り可
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exams_read" ON exams FOR SELECT USING (true);
CREATE POLICY "questions_read" ON questions FOR SELECT USING (true);
CREATE POLICY "choices_read" ON choices FOR SELECT USING (true);

-- ユーザーは自分のプロフィールのみ操作可能
CREATE POLICY "profiles_select_own" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- ユーザーは自分の解答のみ操作可能
CREATE POLICY "answers_select_own" ON user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "answers_insert_own" ON user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のテスト結果のみ操作可能
CREATE POLICY "results_select_own" ON test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "results_insert_own" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のブックマークのみ操作可能
CREATE POLICY "bookmarks_select_own" ON user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own" ON user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own" ON user_bookmarks FOR DELETE USING (auth.uid() = user_id);
