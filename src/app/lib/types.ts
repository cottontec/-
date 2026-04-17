// 英検アプリ 型定義

export type Grade = "5kyu" | "4kyu" | "3kyu" | "pre2kyu" | "2kyu" | "pre1kyu" | "1kyu";
export type Section = "reading" | "listening" | "writing";
export type QuestionType = "vocabulary" | "grammar" | "reading_comprehension" | "listening" | "writing";
export type UserRole = "student" | "teacher";
/** クイズ受験モード: 通し or セクション別 */
export type QuizMode = "full" | "reading" | "listening" | "writing";
export const QUIZ_MODES: QuizMode[] = ["full", "reading", "listening", "writing"];
export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  full: "通し",
  reading: "リーディング",
  listening: "リスニング",
  writing: "ライティング",
};

/** 大問の区切り定義（英検公式準拠） */
export interface ExamSection {
  name: string;      // 例: "大問1 語彙"
  startQ: number;    // 開始問題番号
  endQ: number;      // 終了問題番号
}

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
  hasWriting?: boolean; // ライティング問題あり
  listeningStartQ?: number; // リスニング問題の開始番号（マークシート内）
  writingModelAnswer?: string; // ライティング模範解答
  writingTopic?: string; // ライティング問題文
  listeningAudioUrl?: string; // リスニング音声URL（問題PDFとは別）
  /** 大問構成（ラップタイム記録用） */
  sections?: ExamSection[];
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

/** 大問ごとのラップタイム */
export interface LapTime {
  sectionName: string;
  startQ: number;
  endQ: number;
  elapsedMs: number; // 開始からの経過ミリ秒
  durationMs: number; // この大問にかかった時間
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
  /** 受験モード（未指定は"full"扱い） */
  mode?: QuizMode;
  /** 大問ごとのラップタイム */
  lapTimes?: LapTime[];
  /** 大問ごとの正答率 */
  sectionScores?: { name: string; score: number; total: number; percentage: number }[];
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

/** 先生のカウンセリングコメント */
export interface CounselingNote {
  id: string;
  teacherId: string;
  studentId: string;
  resultId?: string; // 特定の結果に紐づく場合
  autoAdvice: string; // 自動生成アドバイス
  teacherComment: string; // 先生の自由コメント
  createdAt: string;
}

/** アプリ内通知 */
export interface AppNotification {
  id: string;
  recipientId: string; // 通知先ユーザーID
  type: "submission" | "counseling" | "assignment" | "general";
  title: string;
  message: string;
  link?: string; // クリック時の遷移先
  read: boolean;
  createdAt: string;
}

/** 試験の解説コンテンツ（後から先生が追加） */
export interface ExamExplanation {
  examId: string;
  /** 大問ごとの解説 */
  sections: ExplanationSection[];
  updatedAt: string;
}

export interface ExplanationSection {
  name: string; // 例: "大問1 語彙"
  content: string; // Markdown/テキスト解説
  questionRange: string; // 例: "問1〜15"
}

/** 指導ポイント（先生アカウントのみ閲覧可） */
export interface TeachingPoint {
  examId: string;
  /** 大問ごとの指導ポイント */
  sections: TeachingPointSection[];
  updatedAt: string;
}

export interface TeachingPointSection {
  name: string;
  point: string; // 指導のポイント
  commonMistakes: string; // よくある間違い
  advice: string; // 指導アドバイス
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

/**
 * 英検公式の大問構成（2024年度リニューアル後）
 * ※マークシートの問題番号に対応
 * ※ライティングはマークシート外（別途WritingAnswer）
 */
export const GRADE_SECTIONS: Record<Grade, ExamSection[]> = {
  // 5級: 筆記25問（大問1-3）+ リスニング25問 = 計50問だが、マークシートは25問
  "5kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 15 },
    { name: "大問2 会話文の文空所補充", startQ: 16, endQ: 20 },
    { name: "大問3 日本文付き短文の語句整序", startQ: 21, endQ: 25 },
  ],
  // 4級: 筆記35問（大問1-4）+ リスニング30問 = 計65問だが、マークシートは35問
  "4kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 15 },
    { name: "大問2 会話文の文空所補充", startQ: 16, endQ: 20 },
    { name: "大問3 日本文付き短文の語句整序", startQ: 21, endQ: 25 },
    { name: "大問4 長文の内容一致選択", startQ: 26, endQ: 35 },
  ],
  // 3級(2024リニューアル): 筆記15問(大問1)+5問(大問2)+9問(大問3)=29問 + Writing2題
  "3kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 15 },
    { name: "大問2 会話文の文空所補充", startQ: 16, endQ: 20 },
    { name: "大問3 長文の内容一致選択", startQ: 21, endQ: 29 },
  ],
  // 準2級(2024リニューアル): 大問1(15問)+大問2(5問)+大問3A(2問)+大問3B(3問)+大問4(5問)=30問
  "pre2kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 15 },
    { name: "大問2 会話文の文空所補充", startQ: 16, endQ: 20 },
    { name: "大問3 長文の空所補充", startQ: 21, endQ: 25 },
    { name: "大問4 長文の内容一致選択", startQ: 26, endQ: 30 },
  ],
  // 2級(2024リニューアル): 大問1(17問)+大問2(6問)+大問3(8問)=31問 + Writing2題
  "2kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 17 },
    { name: "大問2 長文の空所補充", startQ: 18, endQ: 23 },
    { name: "大問3 長文の内容一致選択", startQ: 24, endQ: 31 },
  ],
  // 準1級(2024リニューアル): 大問1(18問)+大問2(6問)+大問3(7問)=31問 + Writing2題
  "pre1kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 18 },
    { name: "大問2 長文の空所補充", startQ: 19, endQ: 24 },
    { name: "大問3 長文の内容一致選択", startQ: 25, endQ: 31 },
  ],
  // 1級(2024リニューアル): 大問1(10問)+大問2(6問)+大問3(10問)=26問 + Writing2題
  "1kyu": [
    { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 10 },
    { name: "大問2 長文の空所補充", startQ: 11, endQ: 16 },
    { name: "大問3 長文の内容一致選択", startQ: 17, endQ: 26 },
  ],
};

/** 自動アドバイス生成 */
export function generateAutoAdvice(
  result: QuizResult,
  _grade?: Grade,
): string {
  const lines: string[] = [];
  const pct = result.percentage;

  if (pct >= 80) lines.push("全体的に素晴らしい成績です！この調子で次の級にもチャレンジしましょう。");
  else if (pct >= 60) lines.push("合格ラインに近い成績です。苦手分野を重点的に復習しましょう。");
  else lines.push("基礎力の強化が必要です。単語・文法の復習から始めましょう。");

  if (result.sectionScores) {
    const weak = result.sectionScores
      .filter((s) => s.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage);
    if (weak.length > 0) {
      lines.push(`\n【弱点】${weak.map((s) => `${s.name}(${s.percentage}%)`).join("、")}`);
      lines.push("この分野を集中的に対策することをお勧めします。");
    }

    const strong = result.sectionScores
      .filter((s) => s.percentage >= 80)
      .sort((a, b) => b.percentage - a.percentage);
    if (strong.length > 0) {
      lines.push(`\n【得意】${strong.map((s) => `${s.name}(${s.percentage}%)`).join("、")}`);
    }
  }

  if (result.lapTimes && result.lapTimes.length > 0) {
    const slow = result.lapTimes
      .filter((l) => l.durationMs > 0)
      .sort((a, b) => {
        const aPerQ = a.durationMs / (a.endQ - a.startQ + 1);
        const bPerQ = b.durationMs / (b.endQ - b.startQ + 1);
        return bPerQ - aPerQ;
      });
    if (slow.length > 0) {
      const s = slow[0];
      const perQ = Math.round(s.durationMs / (s.endQ - s.startQ + 1) / 1000);
      lines.push(`\n【時間配分】「${s.sectionName}」に1問あたり${perQ}秒かかっています。時間を意識した演習を心がけましょう。`);
    }
  }

  return lines.join("\n");
}
