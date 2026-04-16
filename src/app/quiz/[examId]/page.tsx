"use client";

import { useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AudioPlayer from "@/app/components/AudioPlayer";
import PdfViewer from "@/app/components/PdfViewer";
import MarkSheet from "@/app/components/MarkSheet";
import WritingAnswer from "@/app/components/WritingAnswer";
import { useAuth } from "@/app/lib/auth-context";
import { getQuestions, SAMPLE_EXAMS } from "@/app/lib/data";
import { saveResult } from "@/app/lib/storage";
import type { Question } from "@/app/lib/types";
import { ArrowLeft, ArrowRight, Check, Clock, Send } from "lucide-react";

export default function QuizPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
  const startTimeRef = useRef(0);

  const getTimestamp = () => new Date().getTime();

  const currentQuestion = questions[currentIndex];
  const totalQuestions = isPdfMode ? (exam?.questionCount ?? 0) : questions.length;
  const answeredCount = isPdfMode
    ? Object.keys(markAnswers).length
    : Object.keys(textAnswers).length;

  const handleTextSelect = (questionId: string, label: string) => {
    if (startTimeRef.current === 0) startTimeRef.current = getTimestamp();
    setTextAnswers((prev) => ({ ...prev, [questionId]: label }));
  };

  const handleMarkChange = (answers: Record<number, number>) => {
    if (startTimeRef.current === 0) startTimeRef.current = getTimestamp();
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
    });

    if (!isPdfMode) {
      router.push(`/result/${resultId}`);
    }
    setSubmitting(false);
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32 text-gray-500">
          試験が見つかりませんでした
        </div>
      </div>
    );
  }

  // ===== PDF + マークシートモード =====
  if (isPdfMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-[1600px] px-3 py-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{exam.title}</h2>

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
                <div className="rounded-lg border bg-white py-20 text-center text-gray-400">
                  PDF URLが設定されていません
                </div>
              )}
            </div>

            {/* 右: マークシート + ライティング */}
            <div className="space-y-4">
              {exam.listeningStartQ && (
                <p className="text-xs text-gray-500">
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
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
                <div className="rounded-lg border bg-amber-50 p-4">
                  <h4 className="mb-2 text-sm font-bold text-amber-800">ライティング模範解答</h4>
                  {exam.writingTopic && (
                    <p className="mb-3 text-xs text-amber-700">{exam.writingTopic}</p>
                  )}
                  <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-32 text-gray-500">
          問題が見つかりませんでした
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* 音声・PDF */}
        {(exam.audioUrl || exam.pdfUrl) && (
          <div className="mb-6 space-y-4">
            {exam.audioUrl && <AudioPlayer src={exam.audioUrl} title="リスニング音声" />}
            {exam.pdfUrl && <PdfViewer src={exam.pdfUrl} title="問題PDF" />}
          </div>
        )}

        {/* 進捗 */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>問題 {currentIndex + 1} / {totalQuestions}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> 回答済み: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="mb-6 h-2 w-full rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
        </div>

        {/* 問題番号ドット */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id} onClick={() => setCurrentIndex(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition ${
                i === currentIndex ? "bg-blue-600 text-white"
                : textAnswers[q.id] ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-600"
              }`}
            >
              {q.number}
            </button>
          ))}
        </div>

        {/* 問題 */}
        {currentQuestion && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-medium text-gray-500">第{currentQuestion.number}問</p>
            <p className="mb-6 whitespace-pre-wrap text-lg text-gray-900">{currentQuestion.text}</p>
            <div className="space-y-3">
              {currentQuestion.choices.map((choice) => {
                const isSelected = textAnswers[currentQuestion.id] === choice.label;
                return (
                  <button
                    key={choice.label}
                    onClick={() => handleTextSelect(currentQuestion.id, choice.label)}
                    className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
                      isSelected ? "border-blue-500 bg-blue-50 text-blue-900" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {choice.label}
                    </span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ナビ */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30"
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
