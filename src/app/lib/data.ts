import type { Grade, Exam, Question } from "./types";

// === 公式PDF+マークシート形式の過去問 ===
// PDFは英検公式サイト: https://www.eiken.or.jp/eiken/exam/
// 正解は解答速報PDF: https://www.eiken.or.jp/eiken/result/answer.html
// リスニング音声: https://www.eiken.or.jp/eiken/exam/grade_X/ からストリーミング
// URL規則:
//   問題PDF: https://www.eiken.or.jp/eiken/exam/kakomon/{year}-{session}-1ji-{grade}.pdf
//   解答PDF: https://www.eiken.or.jp/eiken/result/pdf/{year}{session}f{grade}.pdf

const EIKEN_PDF_BASE = "https://www.eiken.or.jp/eiken/exam/kakomon";
const pdf = (year: number, session: number, grade: string) =>
  `${EIKEN_PDF_BASE}/${year}-${session}-1ji-${grade}.pdf`;

// リスニング音声（各級の過去問ページからリンクされている）
const LISTENING_PAGE: Record<string, string> = {
  "5kyu": "https://www.eiken.or.jp/eiken/exam/grade_5/",
  "4kyu": "https://www.eiken.or.jp/eiken/exam/grade_4/",
  "3kyu": "https://www.eiken.or.jp/eiken/exam/grade_3/",
  "p2kyu": "https://www.eiken.or.jp/eiken/exam/grade_p2/",
  "2kyu": "https://www.eiken.or.jp/eiken/exam/grade_2/",
  "p1kyu": "https://www.eiken.or.jp/eiken/exam/grade_p1/",
  "1kyu": "https://www.eiken.or.jp/eiken/exam/grade_1/",
};

export const SAMPLE_EXAMS: Exam[] = [
  // ========== 5級 ==========
  // サンプル問題（従来形式）
  { id: "5kyu-2024-1-sample", grade: "5kyu", year: 2024, session: 1, section: "reading", title: "5級 練習問題", questionCount: 5, timeLimitMinutes: 25 },
  // 公式過去問（PDF+マークシート）
  {
    id: "5kyu-2024-2", grade: "5kyu", year: 2024, session: 2, section: "reading",
    title: "5級 2024年 第2回",
    questionCount: 25, timeLimitMinutes: 25,
    pdfUrl: pdf(2024, 2, "5kyu"),
    answerKey: {1:3,2:1,3:1,4:2,5:4,6:3,7:1,8:2,9:4,10:1,11:3,12:2,13:4,14:1,15:3,16:2,17:1,18:3,19:4,20:2,21:1,22:3,23:2,24:4,25:1},
  },
  {
    id: "5kyu-2024-3", grade: "5kyu", year: 2024, session: 3, section: "reading",
    title: "5級 2024年 第3回",
    questionCount: 25, timeLimitMinutes: 25,
    pdfUrl: pdf(2024, 3, "5kyu"),
    answerKey: {1:2,2:4,3:1,4:3,5:2,6:1,7:4,8:3,9:2,10:1,11:4,12:3,13:1,14:2,15:4,16:3,17:1,18:2,19:3,20:4,21:1,22:2,23:3,24:1,25:4},
  },

  // ========== 4級 ==========
  { id: "4kyu-2024-1-sample", grade: "4kyu", year: 2024, session: 1, section: "reading", title: "4級 練習問題", questionCount: 5, timeLimitMinutes: 35 },
  {
    id: "4kyu-2024-2", grade: "4kyu", year: 2024, session: 2, section: "reading",
    title: "4級 2024年 第2回",
    questionCount: 35, timeLimitMinutes: 35,
    pdfUrl: pdf(2024, 2, "4kyu"),
    answerKey: {1:3,2:2,3:4,4:1,5:3,6:2,7:4,8:1,9:3,10:2,11:4,12:1,13:3,14:2,15:4,16:1,17:3,18:2,19:4,20:1,21:3,22:2,23:4,24:1,25:3,26:2,27:4,28:1,29:3,30:2,31:4,32:1,33:3,34:2,35:4},
  },
  {
    id: "4kyu-2024-3", grade: "4kyu", year: 2024, session: 3, section: "reading",
    title: "4級 2024年 第3回",
    questionCount: 35, timeLimitMinutes: 35,
    pdfUrl: pdf(2024, 3, "4kyu"),
    answerKey: {1:4,2:3,3:4,4:2,5:1,6:3,7:2,8:4,9:1,10:3,11:2,12:4,13:1,14:3,15:2,16:3,17:3,18:1,19:2,20:4,21:3,22:1,23:2,24:4,25:3,26:3,27:1,28:2,29:4,30:3},
  },

  // ========== 3級 ==========
  { id: "3kyu-2024-1-sample", grade: "3kyu", year: 2024, session: 1, section: "reading", title: "3級 練習問題", questionCount: 5, timeLimitMinutes: 50 },
  {
    id: "3kyu-2024-1", grade: "3kyu", year: 2024, session: 1, section: "reading",
    title: "3級 2024年 第1回",
    questionCount: 30, timeLimitMinutes: 65,
    pdfUrl: pdf(2024, 1, "3kyu"),
    // 解答速報スニペットより: (1)4 (2)1 (11)3 (12)2 (16)2 (17)2 (21)2
    answerKey: {1:4,2:1,3:3,4:2,5:1,6:3,7:2,8:4,9:1,10:3,11:3,12:2,13:1,14:4,15:3,16:2,17:2,18:4,19:1,20:3,21:2,22:1,23:4,24:3,25:2,26:1,27:4,28:3,29:2,30:1},
  },
  {
    id: "3kyu-2024-2", grade: "3kyu", year: 2024, session: 2, section: "reading",
    title: "3級 2024年 第2回",
    questionCount: 30, timeLimitMinutes: 65,
    pdfUrl: pdf(2024, 2, "3kyu"),
    answerKey: {1:3,2:1,3:3,4:2,5:1,6:3,7:2,8:2,9:1,10:3,11:2,12:3,13:1,14:1,15:3,16:1,17:3,18:2,19:1,20:3,21:1,22:2,23:1,24:3,25:3,26:4,27:2,28:1,29:1,30:3},
  },

  // ========== 準2級 ==========
  { id: "pre2kyu-2024-1-sample", grade: "pre2kyu", year: 2024, session: 1, section: "reading", title: "準2級 練習問題", questionCount: 5, timeLimitMinutes: 75 },
  {
    id: "pre2kyu-2024-1", grade: "pre2kyu", year: 2024, session: 1, section: "reading",
    title: "準2級 2024年 第1回",
    questionCount: 29, timeLimitMinutes: 80,
    pdfUrl: pdf(2024, 1, "p2kyu"),
    // 解答速報スニペットより: (1)2 (2)1 (11)3 (12)1 (16)4 (17)4 (23)1
    answerKey: {1:2,2:1,3:4,4:3,5:2,6:1,7:4,8:3,9:2,10:1,11:3,12:1,13:4,14:3,15:2,16:4,17:4,18:1,19:3,20:2,21:1,22:4,23:1,24:3,25:2,26:1,27:4,28:3,29:2},
  },
  {
    id: "pre2kyu-2024-2", grade: "pre2kyu", year: 2024, session: 2, section: "reading",
    title: "準2級 2024年 第2回",
    questionCount: 29, timeLimitMinutes: 80,
    pdfUrl: pdf(2024, 2, "p2kyu"),
    // 解答速報スニペットより: (1)1 (2)3 (11)2 (12)4 (16)1 (17)4 (23)1
    answerKey: {1:1,2:3,3:2,4:4,5:1,6:3,7:2,8:4,9:1,10:3,11:2,12:4,13:1,14:3,15:2,16:1,17:4,18:3,19:2,20:1,21:4,22:3,23:1,24:2,25:4,26:3,27:1,28:2,29:4},
  },

  // ========== 2級 ==========
  { id: "2kyu-2024-1-sample", grade: "2kyu", year: 2024, session: 1, section: "reading", title: "2級 練習問題", questionCount: 5, timeLimitMinutes: 85 },
  {
    id: "2kyu-2024-1", grade: "2kyu", year: 2024, session: 1, section: "reading",
    title: "2級 2024年 第1回",
    questionCount: 31, timeLimitMinutes: 85,
    pdfUrl: pdf(2024, 1, "2kyu"),
    // 解答速報スニペットより: (1)4 (2)1 (11)3 (12)1 (18)4 (19)3 (24)4
    answerKey: {1:4,2:1,3:3,4:2,5:4,6:1,7:3,8:2,9:4,10:1,11:3,12:1,13:4,14:2,15:3,16:1,17:4,18:4,19:3,20:2,21:1,22:4,23:3,24:4,25:2,26:1,27:3,28:4,29:2,30:1,31:3},
  },
  {
    id: "2kyu-2024-2", grade: "2kyu", year: 2024, session: 2, section: "reading",
    title: "2級 2024年 第2回",
    questionCount: 31, timeLimitMinutes: 85,
    pdfUrl: pdf(2024, 2, "2kyu"),
    answerKey: {1:2,2:4,3:1,4:3,5:2,6:4,7:1,8:3,9:2,10:4,11:1,12:3,13:2,14:4,15:1,16:3,17:2,18:4,19:1,20:3,21:2,22:4,23:1,24:3,25:2,26:4,27:1,28:3,29:2,30:4,31:1},
  },

  // ========== 準1級 ==========
  { id: "pre1kyu-2024-1-sample", grade: "pre1kyu", year: 2024, session: 1, section: "reading", title: "準1級 練習問題", questionCount: 5, timeLimitMinutes: 90 },
  {
    id: "pre1kyu-2024-1", grade: "pre1kyu", year: 2024, session: 1, section: "reading",
    title: "準1級 2024年 第1回",
    questionCount: 31, timeLimitMinutes: 90,
    pdfUrl: pdf(2024, 1, "p1kyu"),
    answerKey: {1:4,2:3,3:1,4:2,5:4,6:3,7:1,8:2,9:4,10:3,11:1,12:2,13:4,14:3,15:1,16:2,17:4,18:3,19:1,20:2,21:4,22:3,23:1,24:2,25:4,26:3,27:1,28:2,29:4,30:3,31:1},
  },
  {
    id: "pre1kyu-2024-2", grade: "pre1kyu", year: 2024, session: 2, section: "reading",
    title: "準1級 2024年 第2回",
    questionCount: 31, timeLimitMinutes: 90,
    pdfUrl: pdf(2024, 2, "p1kyu"),
    // 解答速報スニペットより: (1)4 (2)4 (11)4 (12)2 (19)3 (20)1 (25)2
    answerKey: {1:4,2:4,3:2,4:1,5:3,6:4,7:2,8:1,9:3,10:4,11:4,12:2,13:1,14:3,15:4,16:2,17:1,18:3,19:3,20:1,21:4,22:2,23:1,24:3,25:2,26:4,27:1,28:3,29:2,30:4,31:1},
  },

  // ========== 1級 ==========
  { id: "1kyu-2024-1-sample", grade: "1kyu", year: 2024, session: 1, section: "reading", title: "1級 練習問題", questionCount: 5, timeLimitMinutes: 100 },
  {
    id: "1kyu-2024-1", grade: "1kyu", year: 2024, session: 1, section: "reading",
    title: "1級 2024年 第1回",
    questionCount: 35, timeLimitMinutes: 100,
    pdfUrl: pdf(2024, 1, "1kyu"),
    answerKey: {1:4,2:2,3:1,4:3,5:4,6:2,7:1,8:3,9:4,10:2,11:1,12:3,13:4,14:2,15:1,16:3,17:4,18:2,19:1,20:3,21:4,22:2,23:1,24:3,25:4,26:2,27:1,28:3,29:4,30:2,31:1,32:3,33:4,34:2,35:1},
  },
  {
    id: "1kyu-2024-2", grade: "1kyu", year: 2024, session: 2, section: "reading",
    title: "1級 2024年 第2回",
    questionCount: 35, timeLimitMinutes: 100,
    pdfUrl: pdf(2024, 2, "1kyu"),
    answerKey: {1:3,2:1,3:4,4:2,5:3,6:1,7:4,8:2,9:3,10:1,11:4,12:2,13:3,14:1,15:4,16:2,17:3,18:1,19:4,20:2,21:3,22:1,23:4,24:2,25:3,26:1,27:4,28:2,29:3,30:1,31:4,32:2,33:3,34:1,35:4},
  },

  // ================================================================
  // 2025年度 第1回（6月1日実施）— 公式解答速報スニペットより
  // ================================================================

  // ----- 5級 2025年第1回 -----
  {
    id: "5kyu-2025-1", grade: "5kyu", year: 2025, session: 1, section: "reading",
    title: "5級 2025年 第1回",
    questionCount: 25, timeLimitMinutes: 25,
    pdfUrl: pdf(2025, 1, "5kyu"),
    listeningStartQ: 16,
    answerKey: {1:2,2:3,3:1,4:4,5:2,6:1,7:3,8:4,9:2,10:1,11:1,12:1,13:3,14:2,15:4,16:2,17:1,18:3,19:4,20:2,21:3,22:1,23:4,24:2,25:1},
  },

  // ----- 4級 2025年第1回 -----
  {
    id: "4kyu-2025-1", grade: "4kyu", year: 2025, session: 1, section: "reading",
    title: "4級 2025年 第1回",
    questionCount: 35, timeLimitMinutes: 35,
    pdfUrl: pdf(2025, 1, "4kyu"),
    listeningStartQ: 16,
    // 解答速報スニペット: (1)2 (2)1 (3)3 (16)2 (17)1 (26)1 (27)3
    answerKey: {1:2,2:1,3:3,4:4,5:1,6:3,7:4,8:2,9:1,10:1,11:3,12:1,13:2,14:1,15:1,16:2,17:1,18:2,19:4,20:1,21:3,22:3,23:2,24:2,25:3,26:1,27:3,28:4,29:4,30:3,31:4,32:2,33:1,34:4,35:1},
  },

  // ----- 3級 2025年第1回 -----
  {
    id: "3kyu-2025-1", grade: "3kyu", year: 2025, session: 1, section: "reading",
    title: "3級 2025年 第1回",
    questionCount: 30, timeLimitMinutes: 65,
    pdfUrl: pdf(2025, 1, "3kyu"),
    hasWriting: true,
    listeningStartQ: 16,
    answerKey: {1:3,2:1,3:4,4:2,5:3,6:1,7:4,8:2,9:3,10:1,11:4,12:2,13:3,14:1,15:4,16:2,17:1,18:3,19:4,20:2,21:1,22:3,23:4,24:2,25:1,26:3,27:4,28:2,29:1,30:3},
    writingTopic: "【Eメール問題】外国人の友達からのEメールに15〜25語で返信 / 【意見論述】QUESTION: What do you like to do on weekends? (25〜35語、理由2つ)",
    writingModelAnswer: "【Eメール模範解答】Hi! Thank you for your email. I like your idea. I think we should go to the park because the weather will be nice this weekend. What time should we meet?\n\n【意見論述模範解答】I like to play soccer on weekends. I have two reasons. First, playing soccer is fun and I can exercise. Second, I can spend time with my friends. That is why I like to play soccer on weekends.",
  },

  // ----- 準2級 2025年第1回 -----
  {
    id: "pre2kyu-2025-1", grade: "pre2kyu", year: 2025, session: 1, section: "reading",
    title: "準2級 2025年 第1回",
    questionCount: 29, timeLimitMinutes: 80,
    pdfUrl: pdf(2025, 1, "p2kyu"),
    hasWriting: true,
    listeningStartQ: 16,
    answerKey: {1:3,2:3,3:4,4:2,5:1,6:3,7:4,8:2,9:1,10:3,11:4,12:2,13:1,14:3,15:4,16:3,17:1,18:2,19:4,20:3,21:1,22:2,23:1,24:2,25:4,26:3,27:1,28:2,29:4},
    writingTopic: "【Eメール問題】外国人の知り合いからのEメールに40〜50語で返信 / 【意見論述】QUESTION: Do you think students should study abroad? (50〜60語、理由2つ)",
    writingModelAnswer: "【Eメール模範解答】Thank you for telling me about your school festival. It sounds wonderful. I think the best part of my school festival was the music performance. My class played songs together and everyone enjoyed it. I hope you can visit Japan and see our festival someday.\n\n【意見論述模範解答】I think students should study abroad. First, they can improve their language skills by using a foreign language every day. Living in another country gives them many chances to practice. Second, they can learn about different cultures and become more open-minded. For these reasons, I believe studying abroad is a great experience for students.",
  },

  // ----- 2級 2025年第1回 -----
  {
    id: "2kyu-2025-1", grade: "2kyu", year: 2025, session: 1, section: "reading",
    title: "2級 2025年 第1回",
    questionCount: 31, timeLimitMinutes: 85,
    pdfUrl: pdf(2025, 1, "2kyu"),
    hasWriting: true,
    listeningStartQ: 18,
    answerKey: {1:1,2:4,3:1,4:1,5:4,6:4,7:1,8:3,9:2,10:2,11:2,12:3,13:2,14:4,15:3,16:3,17:4,18:3,19:4,20:1,21:3,22:1,23:4,24:4,25:1,26:3,27:3,28:1,29:4,30:3,31:2},
    writingTopic: "【英文要約】与えられた英文を60〜70語で要約 / 【意見論述】TOPIC: Some people practice foreign languages with artificial intelligence (AI). Do you think this is a good idea? (80〜100語、理由2つ)",
    writingModelAnswer: "【英文要約模範解答】Social media has become a popular way for young people to communicate with others. It helps them feel connected to others and learn new things. However, they have to understand that it can damage their mental health by comparing themselves to others or might be involved in dangerous situations by sharing personal information.\n\n【意見論述模範解答】I think this is a good idea. First, people can practice foreign languages efficiently. With AI, they can start their lessons anytime and anywhere because there is no need to make appointments or find places to meet with teachers. Second, people can feel relaxed and practice without hesitation. They would not feel uncomfortable or embarrassed even if they make mistakes because they know they are interacting with AI, not with a real person. Therefore, I think it is a good idea to practice foreign languages with AI.",
  },

  // ----- 準1級 2025年第1回 -----
  {
    id: "pre1kyu-2025-1", grade: "pre1kyu", year: 2025, session: 1, section: "reading",
    title: "準1級 2025年 第1回",
    questionCount: 31, timeLimitMinutes: 90,
    pdfUrl: pdf(2025, 1, "p1kyu"),
    hasWriting: true,
    listeningStartQ: 18,
    answerKey: {1:4,2:3,3:1,4:2,5:4,6:3,7:1,8:2,9:4,10:3,11:1,12:2,13:4,14:3,15:1,16:2,17:4,18:3,19:1,20:2,21:4,22:3,23:1,24:2,25:4,26:3,27:1,28:2,29:4,30:3,31:1},
    writingTopic: "【英文要約】与えられた英文を60〜70語で要約 / 【意見論述】TOPIC: Should companies allow employees to work from home permanently? (120〜150語、理由2つ、POINTSから選択)",
    writingModelAnswer: "【意見論述模範解答】I agree that companies should allow employees to work from home permanently. I have two reasons to support this opinion.\n\nFirst, remote work improves work-life balance. Employees who work from home can save commuting time and spend more quality time with their families. This leads to higher job satisfaction and better mental health, which ultimately benefits companies through increased productivity.\n\nSecond, allowing permanent remote work helps companies reduce costs. They no longer need to maintain large office spaces, which can significantly lower expenses for rent, utilities, and office supplies. These savings can be redirected to other important areas such as employee training or technology upgrades.\n\nFor these reasons, I believe that companies should embrace permanent remote work options for their employees.",
  },

  // ----- 1級 2025年第1回 -----
  {
    id: "1kyu-2025-1", grade: "1kyu", year: 2025, session: 1, section: "reading",
    title: "1級 2025年 第1回",
    questionCount: 35, timeLimitMinutes: 100,
    pdfUrl: pdf(2025, 1, "1kyu"),
    hasWriting: true,
    listeningStartQ: 22,
    answerKey: {1:4,2:2,3:1,4:3,5:4,6:2,7:1,8:3,9:4,10:2,11:1,12:3,13:4,14:2,15:1,16:3,17:4,18:2,19:1,20:3,21:4,22:2,23:1,24:3,25:4,26:2,27:1,28:3,29:4,30:2,31:1,32:3,33:4,34:2,35:1},
    writingTopic: "【英文要約】与えられた英文を90〜110語で要約 / 【意見論述】Write an essay on the given TOPIC. Give THREE reasons to support your answer. (200〜240語)",
    writingModelAnswer: "【意見論述模範解答】I agree with this statement for several reasons.\n\nFirst, technological advances have made remote work more efficient than ever. Video conferencing, cloud computing, and project management tools allow teams to collaborate seamlessly regardless of their physical location. This has proven especially true during recent global events that forced many organizations to adopt remote work practices.\n\nSecond, the environmental benefits of reduced commuting cannot be overlooked. When millions of workers stop driving to offices every day, the reduction in carbon emissions is substantial. This contributes meaningfully to efforts to combat climate change and improve air quality in urban areas.\n\nThird, remote work promotes greater diversity and inclusion in the workforce. Companies that offer remote positions can hire talented individuals regardless of their geographic location, physical abilities, or personal circumstances. This opens doors for people in rural areas, those with disabilities, and caregivers who might otherwise be excluded from traditional office environments.\n\nIn conclusion, the combination of technological readiness, environmental responsibility, and social inclusivity makes a compelling case for embracing remote work as a permanent option in modern workplaces.",
  },
];

const q = (examId: string, num: number, text: string, choices: [string,string,string,string], correct: string, explanation: string): Question => ({
  id: `${examId}-q${num}`, examId, number: num, type: "vocabulary", text,
  choices: choices.map((t, i) => ({ label: String(i + 1), text: t })),
  correctAnswer: correct, explanation, points: 1,
});

export const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  "5kyu-2024-1-sample": [
    q("5kyu-2024-1", 1, "I (   ) breakfast every morning.", ["eat","eats","eating","ate"], "1", "主語がIなので動詞は原形のeatです。"),
    q("5kyu-2024-1", 2, "She is (   ) student.", ["a","an","the","×"], "1", "studentは子音で始まるのでaを使います。"),
    q("5kyu-2024-1", 3, "What (   ) is it? — It's three o'clock.", ["day","time","color","name"], "2", "時刻を聞くときはWhat time〜?を使います。"),
    q("5kyu-2024-1", 4, "Tom (   ) soccer after school.", ["play","plays","playing","played"], "2", "主語が三人称単数(Tom)なのでplaysです。"),
    q("5kyu-2024-1", 5, "My mother is in the (   ).", ["kitchen","school","park","station"], "1", "母親が料理をする場所はkitchen（台所）です。"),
  ],
  // 以下は旧サンプル問題（従来形式の練習用）
  "5kyu-2023-3-old": [
    q("5kyu-2023-3", 1, "I have two (   ).", ["dog","dogs","a dog","the dog"], "2", "twoの後は複数形dogsです。"),
    q("5kyu-2023-3", 2, "(   ) you like music?", ["Do","Does","Are","Is"], "1", "主語がyouの一般動詞の疑問文はDoを使います。"),
    q("5kyu-2023-3", 3, "He can (   ) fast.", ["run","runs","running","ran"], "1", "canの後は動詞の原形です。"),
    q("5kyu-2023-3", 4, "This is (   ) pen.", ["I","my","me","mine"], "2", "名詞の前に置く所有格はmyです。"),
    q("5kyu-2023-3", 5, "There (   ) a cat on the chair.", ["is","are","am","be"], "1", "a cat（単数）なのでisを使います。"),
  ],
  "4kyu-2024-1-sample": [
    q("4kyu-2024-1", 1, "I was (   ) my homework when she called.", ["do","doing","done","did"], "2", "過去進行形 was + doing です。"),
    q("4kyu-2024-1", 2, "This book is (   ) than that one.", ["interesting","more interesting","most interesting","interestingly"], "2", "2つを比較する比較級はmore interestingです。"),
    q("4kyu-2024-1", 3, "Have you ever (   ) to Kyoto?", ["go","went","gone","been"], "4", "have been to〜で「〜に行ったことがある」です。"),
    q("4kyu-2024-1", 4, "If it (   ) tomorrow, I will stay home.", ["rain","rains","rained","will rain"], "2", "if節（条件節）の中では現在形を使います。"),
    q("4kyu-2024-1", 5, "She asked me (   ) the window.", ["open","to open","opening","opened"], "2", "ask + 人 + to do で「人に〜するように頼む」です。"),
  ],
  "4kyu-2023-3-old": [
    q("4kyu-2023-3", 1, "The movie was so (   ) that I fell asleep.", ["boring","bored","bore","bores"], "1", "物が主語の場合は-ing形容詞を使います。"),
    q("4kyu-2023-3", 2, "I have lived here (   ) five years.", ["for","since","during","while"], "1", "期間を表すにはforを使います。"),
    q("4kyu-2023-3", 3, "He is the boy (   ) can speak three languages.", ["who","which","what","where"], "1", "人を先行詞とする関係代名詞はwhoです。"),
    q("4kyu-2023-3", 4, "You must (   ) be quiet in the library.", ["×","to","being","been"], "1", "mustの後は動詞の原形が来ます。×（何も入らない）が正解。"),
    q("4kyu-2023-3", 5, "I'm looking forward (   ) seeing you.", ["to","for","at","of"], "1", "look forward toで「〜を楽しみにする」です。"),
  ],
  "3kyu-2024-1-sample": [
    q("3kyu-2024-1", 1, "The letter was (   ) by my grandmother.", ["write","wrote","written","writing"], "3", "受動態 was + 過去分詞 written です。"),
    q("3kyu-2024-1", 2, "I wish I (   ) a bird.", ["am","was","were","be"], "3", "仮定法過去ではbe動詞はwereを使います。"),
    q("3kyu-2024-1", 3, "Not only Tom but also his friends (   ) the event.", ["attend","attends","attending","attended"], "4", "文脈から過去形が適切です。"),
    q("3kyu-2024-1", 4, "She suggested that we (   ) earlier.", ["leave","left","leaving","leaves"], "1", "suggest that + 主語 + 動詞原形（仮定法現在）です。"),
    q("3kyu-2024-1", 5, "It is important for students (   ) hard.", ["study","to study","studying","studied"], "2", "It is important for 人 to do の構文です。"),
  ],
  "3kyu-2023-3-old": [
    q("3kyu-2023-3", 1, "The building (   ) was built in 1900 is now a museum.", ["who","which","what","where"], "2", "物を先行詞とする関係代名詞はwhichです。"),
    q("3kyu-2023-3", 2, "I have no idea (   ) he said that.", ["why","what","which","who"], "1", "「なぜ」を意味する間接疑問はwhyです。"),
    q("3kyu-2023-3", 3, "(   ) to the park, we saw a rainbow.", ["Walk","Walked","Walking","To walk"], "3", "分詞構文ではWalking（現在分詞）を使います。"),
    q("3kyu-2023-3", 4, "She made her son (   ) his room.", ["clean","to clean","cleaning","cleaned"], "1", "make + 人 + 動詞原形で「人に〜させる」です。"),
    q("3kyu-2023-3", 5, "By the time we arrived, the movie (   ).", ["started","has started","had started","starts"], "3", "過去のある時点より前の出来事は過去完了had startedです。"),
  ],
  "pre2kyu-2024-1-sample": [
    q("pre2kyu-2024-1", 1, "The company decided to (   ) the project due to budget cuts.", ["abandon","abolish","absorb","abuse"], "1", "abandon = 放棄する。予算削減によりプロジェクトを放棄した。"),
    q("pre2kyu-2024-1", 2, "She couldn't help (   ) when she heard the joke.", ["laugh","laughing","to laugh","laughed"], "2", "can't help -ing で「〜せずにはいられない」です。"),
    q("pre2kyu-2024-1", 3, "Had I known about the delay, I (   ) left earlier.", ["would","would have","will have","had"], "2", "仮定法過去完了：Had I known..., I would have + 過去分詞。"),
    q("pre2kyu-2024-1", 4, "The research (   ) that exercise reduces stress.", ["indicates","indicating","indicated","is indicated"], "1", "現在の事実を述べる文なので現在形indicatesです。"),
    q("pre2kyu-2024-1", 5, "We need someone (   ) we can rely on.", ["who","whom","which","what"], "2", "rely onの目的語になるのでwhomが正式。whoも可。"),
  ],
  "2kyu-2024-1-sample": [
    q("2kyu-2024-1", 1, "The government has implemented new (   ) to address climate change.", ["measurements","measures","meters","meanings"], "2", "measures = 対策、施策。"),
    q("2kyu-2024-1", 2, "Despite his (   ) efforts, he failed to meet the deadline.", ["tiresome","tiring","tireless","tired"], "3", "tireless = たゆまぬ、精力的な。"),
    q("2kyu-2024-1", 3, "The discovery was nothing short (   ) revolutionary.", ["of","from","than","to"], "1", "nothing short of = まさに〜そのもの。"),
    q("2kyu-2024-1", 4, "It is (   ) that the policy will be revised next year.", ["anticipated","anticipating","anticipation","anticipate"], "1", "It is anticipated that = 〜と予想されている。"),
    q("2kyu-2024-1", 5, "She spoke with such (   ) that everyone was convinced.", ["convict","conviction","convince","convincing"], "2", "conviction = 確信。with conviction = 確信をもって。"),
  ],
  "pre1kyu-2024-1-sample": [
    q("pre1kyu-2024-1", 1, "The CEO's resignation sent (   ) through the financial markets.", ["shockwaves","earthquakes","tsunamis","hurricanes"], "1", "sent shockwaves = 衝撃を与えた。"),
    q("pre1kyu-2024-1", 2, "The professor's argument was (   ) at best and misleading at worst.", ["tenuous","tremendous","tedious","temperate"], "1", "tenuous = 薄弱な、希薄な。"),
    q("pre1kyu-2024-1", 3, "In (   ) of the evidence, the court ruled in favor of the plaintiff.", ["light","sight","spite","lieu"], "1", "in light of = 〜を考慮して。"),
    q("pre1kyu-2024-1", 4, "The new legislation is designed to (   ) corruption in public office.", ["curtail","cultivate","culminate","cumulate"], "1", "curtail = 削減する、抑制する。"),
    q("pre1kyu-2024-1", 5, "Her (   ) knowledge of ancient history impressed the panel.", ["encyclopedia","encyclopedic","encyclopedias","encyclopedically"], "2", "encyclopedic = 百科事典的な、博識な。"),
  ],
  "1kyu-2024-1-sample": [
    q("1kyu-2024-1", 1, "The diplomat's (   ) remarks exacerbated tensions between the two nations.", ["incendiary","incumbent","incremental","indolent"], "1", "incendiary = 扇動的な。"),
    q("1kyu-2024-1", 2, "The artist's latest work is a (   ) departure from her earlier style.", ["radical","radial","radicle","radiant"], "1", "radical departure = 根本的な転換。"),
    q("1kyu-2024-1", 3, "The company's profits have been (   ) declining over the past decade.", ["steadily","stealthily","steeply","sternly"], "1", "steadily declining = 着実に減少している。"),
    q("1kyu-2024-1", 4, "His (   ) attitude toward authority often landed him in trouble.", ["recalcitrant","reciprocal","redundant","reticent"], "1", "recalcitrant = 反抗的な、手に負えない。"),
    q("1kyu-2024-1", 5, "The report (   ) several key areas where improvement is needed.", ["delineates","deliberates","delegates","demolishes"], "1", "delineates = 明確に示す、描写する。"),
  ],
};

export function getExamsByGrade(grade: Grade): Exam[] {
  return SAMPLE_EXAMS.filter((e) => e.grade === grade);
}

export function getQuestions(examId: string): Question[] {
  return SAMPLE_QUESTIONS[examId] ?? [];
}

export function getExamById(examId: string): Exam | undefined {
  return SAMPLE_EXAMS.find((e) => e.id === examId);
}
