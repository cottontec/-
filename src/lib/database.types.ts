export type Grade = "5kyu" | "4kyu" | "3kyu" | "pre2kyu" | "2kyu" | "pre1kyu" | "1kyu";
export type Section = "reading" | "listening" | "writing";
export type QuestionType =
  | "vocabulary"
  | "grammar"
  | "reading_comprehension"
  | "listening"
  | "writing";
export type UserRole = "student" | "teacher";

// Supabase が生成する型との互換用（supabase gen types typescript で将来的に上書き可能）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {}

// アプリ内で使うテーブル型
export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  target_grade: Grade | null;
  created_at: string;
}

export interface Exam {
  id: number;
  grade: Grade;
  year: number;
  session: number;
  section: Section;
  total_questions: number;
  time_limit_minutes: number | null;
  created_at: string;
}

export interface Question {
  id: number;
  exam_id: number;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  question_image_url: string | null;
  audio_url: string | null;
  correct_answer: string;
  explanation: string | null;
  points: number;
  sort_order: number;
}

export interface Choice {
  id: number;
  question_id: number;
  choice_label: string;
  choice_text: string;
  sort_order: number;
}

export interface UserAnswer {
  id: number;
  user_id: string;
  exam_id: number;
  question_id: number;
  selected_answer: string | null;
  is_correct: boolean;
  time_spent_seconds: number | null;
  attempted_at: string;
}

export interface TestResult {
  id: number;
  user_id: string;
  exam_id: number;
  score: number;
  total_points: number;
  percentage: number;
  time_spent_seconds: number | null;
  completed_at: string;
}

export interface UserBookmark {
  id: number;
  user_id: string;
  question_id: number;
  note: string | null;
  created_at: string;
}

export interface Class {
  id: number;
  teacher_id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export interface ClassMember {
  id: number;
  class_id: number;
  student_id: string;
  joined_at: string;
}

export interface Assignment {
  id: number;
  class_id: number;
  exam_id: number;
  teacher_id: string;
  title: string;
  due_date: string | null;
  created_at: string;
}
