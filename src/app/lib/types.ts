// 英検アプリ 型定義

export type Grade = "5kyu" | "4kyu" | "3kyu" | "pre2kyu" | "2kyu" | "pre1kyu" | "1kyu";
export type Section = "reading" | "listening" | "writing";
export type QuestionType = "vocabulary" | "grammar" | "reading_comprehension" | "listening" | "writing";
export type UserRole = "student" | "teacher";

export interface Exam {
  id: string; // e.g. "3kyu-2024-1"
  grade: Grade;
  year: number;
  session: number;
  section: Section;
  title: string;
  questionCount: number;
  timeLimitMinutes: number | null;
  audioUrl?: string;   // リスニング音声URL
  pdfUrl?: string;     // 問題PDF URL
  answerKey?: Record<number, number>; // 正解データ {問題番号: 正解の選択肢番号}
  choiceCount?: number; // 選択肢の数（デフォルト4）
}

export interface Question {
  id: string;
  examId: string;
  number: number;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  choices: Choice[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface Choice {
  label: string;
  text: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface QuizResult {
  id: string;
  examId: string;
  userId: string;
  answers: UserAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  targetGrade?: Grade;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  teacherId: string;
  inviteCode: string;
  createdAt: string;
}

export interface ClassMember {
  classId: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
}

export interface Assignment {
  id: string;
  classId: string;
  examId: string;
  title: string;
  dueDate: string | null;
  createdAt: string;
}

export const GRADE_INFO: Record<Grade, { label: string; color: string; bgColor: string }> = {
  "5kyu":    { label: "5級",  color: "text-green-700",  bgColor: "bg-green-500"  },
  "4kyu":    { label: "4級",  color: "text-blue-700",   bgColor: "bg-blue-500"   },
  "3kyu":    { label: "3級",  color: "text-purple-700", bgColor: "bg-purple-500" },
  "pre2kyu": { label: "準2級", color: "text-orange-700", bgColor: "bg-orange-500" },
  "2kyu":    { label: "2級",  color: "text-red-700",    bgColor: "bg-red-500"    },
  "pre1kyu": { label: "準1級", color: "text-pink-700",   bgColor: "bg-pink-600"   },
  "1kyu":    { label: "1級",  color: "text-yellow-700", bgColor: "bg-yellow-600" },
};

export const GRADES: Grade[] = ["5kyu", "4kyu", "3kyu", "pre2kyu", "2kyu", "pre1kyu", "1kyu"];

export const SECTION_LABELS: Record<Section, string> = {
  reading: "リーディング",
  listening: "リスニング",
  writing: "ライティング",
};
