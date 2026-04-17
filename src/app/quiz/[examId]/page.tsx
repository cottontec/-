"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AudioPlayer from "@/app/components/AudioPlayer";
import PdfViewer from "@/app/components/PdfViewer";
import MarkSheet from "@/app/components/MarkSheet";
import WritingAnswer from "@/app/components/WritingAnswer";
import Timer from "@/app/components/Timer";
import SpeakButton from "@/app/components/SpeakButton";
import { useToast } from "@/app/components/Toast";
import { tapLight, tapMedium, tapSuccess, tapError } from "@/app/lib/haptics";
import { useAuth } from "@/app/lib/auth-context";
import { getQuestions, SAMPLE_EXAMS } from "@/app/lib/data";
import { saveResult, notifyTeachersOfSubmission } from "@/app/lib/storage";
import type { Question, LapTime } from "@/app/lib/types";
import { GRADE_SECTIONS } from "@/app/lib/types";
import { ArrowLeft, ArrowRight, Check, Clock, Send } from "lucide-react";

export default function QuizPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const id = examId as string;

  const exam = SAMPLE_EXAMS.find((e) => e.id === id);
  const isPdfMode = !!exam?.pdfUrl || !!exam?.answerKey;

  // 従来モード用
  const questions: Question[] = useMemo(() => getQuestions(id), [id]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});

  // マークシートモード用
  const [markAnswers, setMarkAnswers] = useState<Record<number, number>>({});
  const [markResults, setMarkResults] = useState<Record<number, boolean> | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [writingAnswer, setWritingAnswer] = useState<{ text: string; imageDataUrl: string | null }>({ text: "", imageDataUrl: null });
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);

  const examSections = exam?.sections ?? (exam ? GRADE_SECTIONS[exam.grade] : undefined);
  const startTimeRef = useRef(0);

  const getTimestamp = () => new Date().getTime();

  // ===== 退出警告（解答中にページを離れようとしたら確認） =====
  useEffect(() => {
    const isAnswering = (Object.keys(textAnswers).length > 0 || Object.keys(markAnswers).length > 0) && !submitted;
    if (!isAnswering) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "解答中です。本当に離れますか？";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [textAnswers, markAnswers, submitted]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = isPdfMode ? (exam?.questionCount ?? 0) : questions.length;
  const answeredCount = isPdfMode
    ? Object.keys(markAnswers).length
    : Object.keys(textAnswers).length;

  const handleTextSelect = (questionId: string, label: string) => {
    if (startTimeRef.current === 0) startTimeRef.current = getTimestamp();
    tapLight();
    setTextAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  // ===== キーボードショートカット（従来モードのみ） =====
  useEffect(() => {
    if (isPdfMode) return;
    const onKey = (e: KeyboardEvent) => {
      // 入力欄では無効化
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const q = questions[currentIndex];
      if (!q) return;

      // 1〜9 で選択肢
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const choice = q.choices[idx];
        if (choice) {
          e.preventDefault();
          handleTextSelect(q.id, choice.label);
        }
        return;
      }
      // ←/→ で問題移動
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else if (e.key === "Enter") {
          handleSubmit();
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPdfMode, currentIndex, questions]);

  const handleMarkChange = (answers: Record<number, number>) => {
    if (startTimeRef.current === 0) startTimeRef.current = getTimestamp();
    if (Object.keys(answers).length !== Object.keys(markAnswers).length) tapLight();
    setMarkAnswers(answers);
  };

  const handleSubmit = async () => {
    if (submitting || !user || !exam) return;
    setSubmitting(true);

    const totalTimeSeconds = startTimeRef.current > 0
      ? Math.round((getTimestamp() - startTimeRef.current) / 1000)
      : 0;

    let score = 0;
    let totalPoints = totalQuestions;

    if (isPdfMode && exam.answerKey) {
      // マークシート採点
      const results: Record<number, boolean> = {};
      for (let i = 1; i <= totalQuestions; i++) {
        const isCorrect = markAnswers[i] === exam.answerKey[i];
        results[i] = isCorrect;
        if (isCorrect) score++;
      }
      setMarkResults(results);
      setSubmitted(true);
      tapMedium();
    } else {
      // 従来モード採点
      questions.forEach((q) => {
        const selected = textAnswers[q.id] ?? null;
        if (selected === q.correctAnswer) score += q.points;
      });
      totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    }

    const percentage = totalPoints > 0
      ? Math.round((score / totalPoints) * 10000) / 100
      : 0;
    // 合格ラインの目安を 60% として触覚でフィードバック
    if (percentage >= 60) tapSuccess(); else tapError();
    const resultId = `${id}-${getTimestamp()}`;

    const userAnswers = isPdfMode
      ? Array.from({ length: totalQuestions }, (_, i) => ({
          questionId: `${id}-q${i + 1}`,
          selectedAnswer: markAnswers[i + 1] ? String(markAnswers[i + 1]) : null,
          isCorrect: exam?.answerKey ? markAnswers[i + 1] === exam.answerKey[i + 1] : false,
        }))
      : questions.map((q) => ({
          questionId: q.id,
          selectedAnswer: textAnswers[q.id] ?? null,
          isCorrect: (textAnswers[q.id] ?? null) === q.correctAnswer,
        }));

    // 大問ごとの正答率を計算
    const sectionScores = examSections?.map((sec) => {
      let secScore = 0;
      let secTotal = 0;
      for (let i = sec.startQ; i <= sec.endQ; i++) {
        secTotal++;
        if (isPdfMode && exam?.answerKey) {
          if (markAnswers[i] === exam.answerKey[i]) secScore++;
        }
      }
      return {
        name: sec.name,
        score: secScore,
        total: secTotal,
        percentage: secTotal > 0 ? Math.round((secScore / secTotal) * 100) : 0,
      };
    });

    await saveResult({
      id: resultId,
      examId: id,
      userId: user.id,
      answers: userAnswers,
      score,
      totalPoints,
      percentage,
      timeSpentSeconds: totalTimeSeconds,
      completedAt: new Date().toISOString(),
      lapTimes: lapTimes.length > 0 ? lapTimes : undefined,
      sectionScores,
    });

    // 先生に通知
    notifyTeachersOfSubmission(
      user.id,
      user.displayName,
      exam.title,
      resultId,
      percentage,
    ).catch(() => {/* 通知失敗は無視 */});

    if (!isPdfMode) {
      router.push(`/result/${resultId}`);
    }
    setSubmitting(false);
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-[var(--muted)]">試験が見つかりませんでした</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // ===== PDF + マークシートモード =====
  if (isPdfMode) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="mx-auto max-w-[1600px] px-3 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)]">{exam.title}</h2>
            {exam.timeLimitMinutes && (
              <Timer
                limitMinutes={exam.timeLimitMinutes}
                active={!submitted && answeredCount > 0}
                onTimeUp={() => {
                  if (!submitted) {
                    toast("制限時間です。自動採点します", "info");
                    handleSubmit();
                  }
                }}
              />
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[4fr_1fr]">
            {/* 左: PDF + 音声 */}
            <div className="space-y-4">
              {exam.audioUrl && (
                <AudioPlayer src={exam.audioUrl} title="リスニング音声" />
              )}
              {exam.pdfUrl && (
                <PdfViewer src={exam.pdfUrl} title="問題用紙" />
              )}
              {!exam.pdfUrl && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-20 text-center text-[var(--muted)]">
                  PDF URLが設定されていません
                </div>
              )}
            </div>

            {/* 右: マークシート + ライティング */}
            <div className="space-y-4">
              {exam.listeningStartQ && (
                <p className="text-xs text-[var(--muted)]">
                  問1〜{exam.listeningStartQ - 1}: 筆記 / 問{exam.listeningStartQ}〜{exam.questionCount}: リスニング
                </p>
              )}

              <MarkSheet
                questionCount={exam.questionCount}
                choiceCount={exam.choiceCount ?? 4}
                onAnswersChange={handleMarkChange}
                results={markResults}
                answerKey={submitted ? exam.answerKey : undefined}
                readOnly={submitted}
                initialAnswers={markAnswers}
                examSections={examSections}
                onLapTimesChange={setLapTimes}
                lapTimes={submitted ? lapTimes : undefined}
              />

              {exam.hasWriting && (
                <WritingAnswer
                  onAnswerChange={setWritingAnswer}
                  readOnly={submitted}
                  initialText={writingAnswer.text}
                  initialImage={writingAnswer.imageDataUrl}
                />
              )}

              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Send size={20} />
                  {submitting ? "採点中..." : "採点する"}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMarkAnswers({});
                      setMarkResults(null);
                      setSubmitted(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                  >
                    もう一度挑戦
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm text-white hover:bg-blue-700"
                  >
                    ホームに戻る
                  </button>
                </div>
              )}

              {/* ライティング模範解答（採点後に表示） */}
              {submitted && exam.writingModelAnswer && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
                  <h4 className="mb-2 text-sm font-bold text-amber-800 dark:text-amber-200">ライティング模範解答</h4>
                  {exam.writingTopic && (
                    <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">{exam.writingTopic}</p>
                  )}
                  <div className="whitespace-pre-wrap text-sm text-[var(--foreground)] leading-relaxed">
                    {exam.writingModelAnswer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===== 従来の問題モード =====
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-[var(--muted)]">この試験にはまだ問題が登録されていません</p>
          <button
            onClick={() => router.push(`/grade/${exam.grade}`)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            他の試験を選ぶ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main
        className="mx-auto max-w-3xl px-4 py-6"
        onTouchStart={(e) => { (e.currentTarget as HTMLElement).dataset.tx = String(e.touches[0].clientX); }}
        onTouchEnd={(e) => {
          const startX = parseFloat((e.currentTarget as HTMLElement).dataset.tx ?? "0");
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) < 60) return;
          if (dx < 0 && currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
          if (dx > 0 && currentIndex > 0) setCurrentIndex(currentIndex - 1);
        }}
      >
        {/* 音声・PDF */}
        {(exam.audioUrl || exam.pdfUrl) && (
          <div className="mb-6 space-y-4">
            {exam.audioUrl && <AudioPlayer src={exam.audioUrl} title="リスニング音声" />}
            {exam.pdfUrl && <PdfViewer src={exam.pdfUrl} title="問題PDF" />}
          </div>
        )}

        {/* 上部バー: 進捗 + タイマー */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted)]">
          <span>問題 {currentIndex + 1} / {totalQuestions}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> 回答済み: {answeredCount}/{totalQuestions}
          </span>
          {exam.timeLimitMinutes && (
            <Timer
              limitMinutes={exam.timeLimitMinutes}
              active={answeredCount > 0 && !submitting}
              onTimeUp={() => {
                toast("制限時間です。自動採点します", "info");
                handleSubmit();
              }}
            />
          )}
        </div>
        <div className="mb-6 h-2 w-full rounded-full bg-[var(--surface-2)]">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
        </div>

        {/* 問題番号ドット */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id} onClick={() => setCurrentIndex(i)}
              className={`flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                i === currentIndex ? "bg-blue-600 text-white"
                : textAnswers[q.id] ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "bg-[var(--surface-2)] text-[var(--muted)]"
              }`}
            >
              {q.number}
            </button>
          ))}
        </div>

        {/* 問題 */}
        {currentQuestion && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--muted)]">第{currentQuestion.number}問</p>
              <SpeakButton text={currentQuestion.text} />
            </div>
            <p className="mb-6 whitespace-pre-wrap text-lg text-[var(--foreground)]">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = textAnswers[currentQuestion.id] === choice.label;
                return (
                  <button
                    key={choice.label}
                    onClick={() => handleTextSelect(currentQuestion.id, choice.label)}
                    className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100"
                        : "border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--foreground)]"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isSelected ? "bg-blue-600 text-white" : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}>
                      {choice.label}
                    </span>
                    <span className="flex-1">{choice.text}</span>
                    <span className="kbd hidden sm:inline-flex" aria-hidden>{idx + 1}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 hidden text-xs text-[var(--muted)] sm:block">
              <span className="kbd">1</span>〜<span className="kbd">{currentQuestion.choices.length}</span> で選択 ・
              <span className="kbd">←</span><span className="kbd">→</span> で問題移動 ・
              <span className="kbd">Enter</span> で次へ
            </p>
          </div>
        )}

        {/* ナビ */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-2)] disabled:opacity-30"
          >
            <ArrowLeft size={16} /> 前の問題
          </button>
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              次の問題 <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Check size={16} /> {submitting ? "送信中..." : "解答を提出"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
