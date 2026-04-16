import type { Grade, Exam, Question } from "./types";

export const SAMPLE_EXAMS: Exam[] = [
  // 5級
  { id: "5kyu-2024-1", grade: "5kyu", year: 2024, session: 1, section: "reading", title: "5級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 25 },
  { id: "5kyu-2023-3", grade: "5kyu", year: 2023, session: 3, section: "reading", title: "5級 2023年 第3回 リーディング", questionCount: 5, timeLimitMinutes: 25 },
  // 4級
  { id: "4kyu-2024-1", grade: "4kyu", year: 2024, session: 1, section: "reading", title: "4級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 35 },
  { id: "4kyu-2023-3", grade: "4kyu", year: 2023, session: 3, section: "reading", title: "4級 2023年 第3回 リーディング", questionCount: 5, timeLimitMinutes: 35 },
  // 3級
  { id: "3kyu-2024-1", grade: "3kyu", year: 2024, session: 1, section: "reading", title: "3級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 50 },
  { id: "3kyu-2023-3", grade: "3kyu", year: 2023, session: 3, section: "reading", title: "3級 2023年 第3回 リーディング", questionCount: 5, timeLimitMinutes: 50 },
  // 3級 PDF+マークシート形式（デモ）
  {
    id: "3kyu-2024-1-pdf",
    grade: "3kyu",
    year: 2024,
    session: 1,
    section: "reading",
    title: "3級 2024年 第1回【PDF+マークシート】",
    questionCount: 30,
    timeLimitMinutes: 50,
    pdfUrl: "", // ← ここに英検公式PDFのURLを設定
    answerKey: {
      1:3, 2:1, 3:4, 4:2, 5:1, 6:3, 7:2, 8:4, 9:1, 10:3,
      11:2, 12:4, 13:1, 14:3, 15:2, 16:1, 17:4, 18:3, 19:2, 20:1,
      21:3, 22:2, 23:4, 24:1, 25:3, 26:2, 27:1, 28:4, 29:3, 30:2,
    },
  },
  // 準2級
  { id: "pre2kyu-2024-1", grade: "pre2kyu", year: 2024, session: 1, section: "reading", title: "準2級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 75 },
  // 2級
  { id: "2kyu-2024-1", grade: "2kyu", year: 2024, session: 1, section: "reading", title: "2級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 85 },
  // 準1級
  { id: "pre1kyu-2024-1", grade: "pre1kyu", year: 2024, session: 1, section: "reading", title: "準1級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 90 },
  // 1級
  { id: "1kyu-2024-1", grade: "1kyu", year: 2024, session: 1, section: "reading", title: "1級 2024年 第1回 リーディング", questionCount: 5, timeLimitMinutes: 100 },
];

const q = (examId: string, num: number, text: string, choices: [string,string,string,string], correct: string, explanation: string): Question => ({
  id: `${examId}-q${num}`, examId, number: num, type: "vocabulary", text,
  choices: choices.map((t, i) => ({ label: String(i + 1), text: t })),
  correctAnswer: correct, explanation, points: 1,
});

export const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  "5kyu-2024-1": [
    q("5kyu-2024-1", 1, "I (   ) breakfast every morning.", ["eat","eats","eating","ate"], "1", "主語がIなので動詞は原形のeatです。"),
    q("5kyu-2024-1", 2, "She is (   ) student.", ["a","an","the","×"], "1", "studentは子音で始まるのでaを使います。"),
    q("5kyu-2024-1", 3, "What (   ) is it? — It's three o'clock.", ["day","time","color","name"], "2", "時刻を聞くときはWhat time〜?を使います。"),
    q("5kyu-2024-1", 4, "Tom (   ) soccer after school.", ["play","plays","playing","played"], "2", "主語が三人称単数(Tom)なのでplaysです。"),
    q("5kyu-2024-1", 5, "My mother is in the (   ).", ["kitchen","school","park","station"], "1", "母親が料理をする場所はkitchen（台所）です。"),
  ],
  "5kyu-2023-3": [
    q("5kyu-2023-3", 1, "I have two (   ).", ["dog","dogs","a dog","the dog"], "2", "twoの後は複数形dogsです。"),
    q("5kyu-2023-3", 2, "(   ) you like music?", ["Do","Does","Are","Is"], "1", "主語がyouの一般動詞の疑問文はDoを使います。"),
    q("5kyu-2023-3", 3, "He can (   ) fast.", ["run","runs","running","ran"], "1", "canの後は動詞の原形です。"),
    q("5kyu-2023-3", 4, "This is (   ) pen.", ["I","my","me","mine"], "2", "名詞の前に置く所有格はmyです。"),
    q("5kyu-2023-3", 5, "There (   ) a cat on the chair.", ["is","are","am","be"], "1", "a cat（単数）なのでisを使います。"),
  ],
  "4kyu-2024-1": [
    q("4kyu-2024-1", 1, "I was (   ) my homework when she called.", ["do","doing","done","did"], "2", "過去進行形 was + doing です。"),
    q("4kyu-2024-1", 2, "This book is (   ) than that one.", ["interesting","more interesting","most interesting","interestingly"], "2", "2つを比較する比較級はmore interestingです。"),
    q("4kyu-2024-1", 3, "Have you ever (   ) to Kyoto?", ["go","went","gone","been"], "4", "have been to〜で「〜に行ったことがある」です。"),
    q("4kyu-2024-1", 4, "If it (   ) tomorrow, I will stay home.", ["rain","rains","rained","will rain"], "2", "if節（条件節）の中では現在形を使います。"),
    q("4kyu-2024-1", 5, "She asked me (   ) the window.", ["open","to open","opening","opened"], "2", "ask + 人 + to do で「人に〜するように頼む」です。"),
  ],
  "4kyu-2023-3": [
    q("4kyu-2023-3", 1, "The movie was so (   ) that I fell asleep.", ["boring","bored","bore","bores"], "1", "物が主語の場合は-ing形容詞を使います。"),
    q("4kyu-2023-3", 2, "I have lived here (   ) five years.", ["for","since","during","while"], "1", "期間を表すにはforを使います。"),
    q("4kyu-2023-3", 3, "He is the boy (   ) can speak three languages.", ["who","which","what","where"], "1", "人を先行詞とする関係代名詞はwhoです。"),
    q("4kyu-2023-3", 4, "You must (   ) be quiet in the library.", ["×","to","being","been"], "1", "mustの後は動詞の原形が来ます。×（何も入らない）が正解。"),
    q("4kyu-2023-3", 5, "I'm looking forward (   ) seeing you.", ["to","for","at","of"], "1", "look forward toで「〜を楽しみにする」です。"),
  ],
  "3kyu-2024-1": [
    q("3kyu-2024-1", 1, "The letter was (   ) by my grandmother.", ["write","wrote","written","writing"], "3", "受動態 was + 過去分詞 written です。"),
    q("3kyu-2024-1", 2, "I wish I (   ) a bird.", ["am","was","were","be"], "3", "仮定法過去ではbe動詞はwereを使います。"),
    q("3kyu-2024-1", 3, "Not only Tom but also his friends (   ) the event.", ["attend","attends","attending","attended"], "4", "文脈から過去形が適切です。"),
    q("3kyu-2024-1", 4, "She suggested that we (   ) earlier.", ["leave","left","leaving","leaves"], "1", "suggest that + 主語 + 動詞原形（仮定法現在）です。"),
    q("3kyu-2024-1", 5, "It is important for students (   ) hard.", ["study","to study","studying","studied"], "2", "It is important for 人 to do の構文です。"),
  ],
  "3kyu-2023-3": [
    q("3kyu-2023-3", 1, "The building (   ) was built in 1900 is now a museum.", ["who","which","what","where"], "2", "物を先行詞とする関係代名詞はwhichです。"),
    q("3kyu-2023-3", 2, "I have no idea (   ) he said that.", ["why","what","which","who"], "1", "「なぜ」を意味する間接疑問はwhyです。"),
    q("3kyu-2023-3", 3, "(   ) to the park, we saw a rainbow.", ["Walk","Walked","Walking","To walk"], "3", "分詞構文ではWalking（現在分詞）を使います。"),
    q("3kyu-2023-3", 4, "She made her son (   ) his room.", ["clean","to clean","cleaning","cleaned"], "1", "make + 人 + 動詞原形で「人に〜させる」です。"),
    q("3kyu-2023-3", 5, "By the time we arrived, the movie (   ).", ["started","has started","had started","starts"], "3", "過去のある時点より前の出来事は過去完了had startedです。"),
  ],
  "pre2kyu-2024-1": [
    q("pre2kyu-2024-1", 1, "The company decided to (   ) the project due to budget cuts.", ["abandon","abolish","absorb","abuse"], "1", "abandon = 放棄する。予算削減によりプロジェクトを放棄した。"),
    q("pre2kyu-2024-1", 2, "She couldn't help (   ) when she heard the joke.", ["laugh","laughing","to laugh","laughed"], "2", "can't help -ing で「〜せずにはいられない」です。"),
    q("pre2kyu-2024-1", 3, "Had I known about the delay, I (   ) left earlier.", ["would","would have","will have","had"], "2", "仮定法過去完了：Had I known..., I would have + 過去分詞。"),
    q("pre2kyu-2024-1", 4, "The research (   ) that exercise reduces stress.", ["indicates","indicating","indicated","is indicated"], "1", "現在の事実を述べる文なので現在形indicatesです。"),
    q("pre2kyu-2024-1", 5, "We need someone (   ) we can rely on.", ["who","whom","which","what"], "2", "rely onの目的語になるのでwhomが正式。whoも可。"),
  ],
  "2kyu-2024-1": [
    q("2kyu-2024-1", 1, "The government has implemented new (   ) to address climate change.", ["measurements","measures","meters","meanings"], "2", "measures = 対策、施策。"),
    q("2kyu-2024-1", 2, "Despite his (   ) efforts, he failed to meet the deadline.", ["tiresome","tiring","tireless","tired"], "3", "tireless = たゆまぬ、精力的な。"),
    q("2kyu-2024-1", 3, "The discovery was nothing short (   ) revolutionary.", ["of","from","than","to"], "1", "nothing short of = まさに〜そのもの。"),
    q("2kyu-2024-1", 4, "It is (   ) that the policy will be revised next year.", ["anticipated","anticipating","anticipation","anticipate"], "1", "It is anticipated that = 〜と予想されている。"),
    q("2kyu-2024-1", 5, "She spoke with such (   ) that everyone was convinced.", ["convict","conviction","convince","convincing"], "2", "conviction = 確信。with conviction = 確信をもって。"),
  ],
  "pre1kyu-2024-1": [
    q("pre1kyu-2024-1", 1, "The CEO's resignation sent (   ) through the financial markets.", ["shockwaves","earthquakes","tsunamis","hurricanes"], "1", "sent shockwaves = 衝撃を与えた。"),
    q("pre1kyu-2024-1", 2, "The professor's argument was (   ) at best and misleading at worst.", ["tenuous","tremendous","tedious","temperate"], "1", "tenuous = 薄弱な、希薄な。"),
    q("pre1kyu-2024-1", 3, "In (   ) of the evidence, the court ruled in favor of the plaintiff.", ["light","sight","spite","lieu"], "1", "in light of = 〜を考慮して。"),
    q("pre1kyu-2024-1", 4, "The new legislation is designed to (   ) corruption in public office.", ["curtail","cultivate","culminate","cumulate"], "1", "curtail = 削減する、抑制する。"),
    q("pre1kyu-2024-1", 5, "Her (   ) knowledge of ancient history impressed the panel.", ["encyclopedia","encyclopedic","encyclopedias","encyclopedically"], "2", "encyclopedic = 百科事典的な、博識な。"),
  ],
  "1kyu-2024-1": [
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
