import type { Grade, Exam, Question, QuizMode } from "./types";

// === 過去問データ ===
// `public/eiken/{gradeDir}/` にアップロードされたPDFを参照する。
// 解答キー（answerKey）は現状未入力 — 自己採点モードで運用。
// ユーザーが解答PDFを見て自己採点する流れ。
//
// 各PDFの命名規則（準2級のアップロード例）:
//   問題PDF:   mondai-{year}-{session}.pdf
//   解答PDF:   kotae-{year}-{session}.pdf or kaitou.pdf (汎用)
//   スクリプト: script-{year}-{session}.pdf

const BASE = "/eiken";

/** 準2級の問題が揃っている年・回 */
const PRE2KYU_AVAILABLE: Array<{ year: number; session: number }> = [
  { year: 2019, session: 3 },
  { year: 2019, session: 2 },
  { year: 2019, session: 1 },
  { year: 2018, session: 3 },
  { year: 2018, session: 2 },
  { year: 2017, session: 1 },
  { year: 2016, session: 2 },
  { year: 2014, session: 2 },
  { year: 2014, session: 1 },
];

/** 解答PDFが個別にアップロードされている (year,session) の集合 */
const PRE2KYU_KOTAE = new Set(["2014-1", "2015-2", "2017-2"]);
/** スクリプトがアップロードされている (year,session) の集合 */
const PRE2KYU_SCRIPT = new Set([
  "2014-2", "2014-3", "2015-1", "2015-2", "2015-3",
  "2016-1", "2017-2", "2017-3",
  "2018-1", "2018-2", "2018-3",
  "2019-1", "2019-2", "2019-3",
]);

/** 準2級 旧形式（2014-2019、2024リニューアル前）の大問構成 */
const PRE2KYU_LEGACY_SECTIONS = [
  { name: "大問1 短文の語句空所補充", startQ: 1, endQ: 15 },
  { name: "大問2 会話文の文空所補充", startQ: 16, endQ: 20 },
  { name: "大問3 長文の内容一致選択", startQ: 21, endQ: 29 },
];

function pre2kyuExam({ year, session }: { year: number; session: number }): Exam {
  const key = `${year}-${session}`;
  const hasKotae = PRE2KYU_KOTAE.has(key);
  const hasScript = PRE2KYU_SCRIPT.has(key);
  return {
    id: `pre2kyu-${year}-${session}`,
    grade: "pre2kyu",
    year,
    session,
    section: "reading",
    title: `準2級 ${year}年 第${session}回`,
    // 2014-2019（リニューアル前）: 大問1(15)+2(5)+3(9)=29問 + リスニング30問(別PDF)
    questionCount: 29,
    timeLimitMinutes: 75,
    pdfUrl: `${BASE}/pre2kyu/mondai-${year}-${session}.pdf`,
    answerPdfUrl: hasKotae
      ? `${BASE}/pre2kyu/kotae-${year}-${session}.pdf`
      : `${BASE}/pre2kyu/kaitou.pdf`,
    scriptPdfUrl: hasScript ? `${BASE}/pre2kyu/script-${year}-${session}.pdf` : undefined,
    sections: PRE2KYU_LEGACY_SECTIONS,
    // answerKey は未入力 → 自己採点モード
  };
}

export const SAMPLE_EXAMS: Exam[] = [
  ...PRE2KYU_AVAILABLE.map(pre2kyuExam),
];

/** 旧サンプル問題（練習用・空） */
export const SAMPLE_QUESTIONS: Record<string, Question[]> = {};

export function getExamsByGrade(grade: Grade): Exam[] {
  return SAMPLE_EXAMS.filter((e) => e.grade === grade);
}

export function getQuestions(examId: string): Question[] {
  return SAMPLE_QUESTIONS[examId] ?? [];
}

export function getExamById(examId: string): Exam | undefined {
  return SAMPLE_EXAMS.find((e) => e.id === examId);
}

/**
 * 指定モードでマークシートの問題番号範囲を返す。
 */
export function getModeRange(exam: Exam, mode: QuizMode): { startQ: number; endQ: number } | null {
  if (mode === "writing") return null;
  if (mode === "full") return { startQ: 1, endQ: exam.questionCount };
  if (mode === "reading") {
    const end = exam.listeningStartQ ? exam.listeningStartQ - 1 : exam.questionCount;
    return { startQ: 1, endQ: end };
  }
  if (mode === "listening") {
    if (!exam.listeningStartQ) return null;
    return { startQ: exam.listeningStartQ, endQ: exam.questionCount };
  }
  return null;
}

/** 指定モードが試験で利用可能か */
export function isModeAvailable(exam: Exam, mode: QuizMode): boolean {
  if (mode === "full") return true;
  if (mode === "writing") return !!exam.hasWriting;
  if (mode === "reading") return true;
  if (mode === "listening") return !!exam.listeningStartQ;
  return false;
}
