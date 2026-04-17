"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import MarkSheet from "@/app/components/MarkSheet";
import { useAuth } from "@/app/lib/auth-context";
import { SAMPLE_EXAMS } from "@/app/lib/data";
import { saveResult, notifyTeachersOfSubmission } from "@/app/lib/storage";
import { GRADE_SECTIONS } from "@/app/lib/types";
import type { LapTime } from "@/app/lib/types";
import { Camera, Upload, X, Send, CheckCircle, ZoomIn, ZoomOut, Move } from "lucide-react";

export default function ScanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [markAnswers, setMarkAnswers] = useState<Record<number, number>>({});
  const [markResults, setMarkResults] = useState<Record<number, boolean> | null>(null);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zoom, setZoom] = useState(100);

  const exam = SAMPLE_EXAMS.find((e) => e.id === selectedExamId);
  const pdfExams = SAMPLE_EXAMS.filter((e) => e.answerKey);
  const examSections = exam ? (exam.sections ?? GRADE_SECTIONS[exam.grade]) : undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (submitting || !user || !exam?.answerKey) return;
    setSubmitting(true);

    let score = 0;
    const results: Record<number, boolean> = {};
    for (let i = 1; i <= exam.questionCount; i++) {
      const isCorrect = markAnswers[i] === exam.answerKey[i];
      results[i] = isCorrect;
      if (isCorrect) score++;
    }
    setMarkResults(results);
    setSubmitted(true);

    const percentage = Math.round((score / exam.questionCount) * 10000) / 100;
    const resultId = `scan-${selectedExamId}-${new Date().getTime()}`;

    const sectionScores = examSections?.map((sec) => {
      let secScore = 0;
      let secTotal = 0;
      for (let i = sec.startQ; i <= sec.endQ; i++) {
        secTotal++;
        if (markAnswers[i] === exam.answerKey![i]) secScore++;
      }
      return { name: sec.name, score: secScore, total: secTotal, percentage: secTotal > 0 ? Math.round((secScore / secTotal) * 100) : 0 };
    });

    await saveResult({
      id: resultId,
      examId: selectedExamId,
      userId: user.id,
      answers: Array.from({ length: exam.questionCount }, (_, i) => ({
        questionId: `${selectedExamId}-q${i + 1}`,
        selectedAnswer: markAnswers[i + 1] ? String(markAnswers[i + 1]) : null,
        isCorrect: results[i + 1] ?? false,
      })),
      score,
      totalPoints: exam.questionCount,
      percentage,
      timeSpentSeconds: 0,
      completedAt: new Date().toISOString(),
      lapTimes: lapTimes.length > 0 ? lapTimes : undefined,
      sectionScores,
    });

    notifyTeachersOfSubmission(user.id, user.displayName, exam.title, resultId, percentage).catch(() => {});
    setSubmitting(false);
  };

  const handleReset = () => {
    setMarkAnswers({});
    setMarkResults(null);
    setSubmitted(false);
    setLapTimes([]);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="mx-auto max-w-[1600px] px-3 py-4">
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
          <Camera size={20} className="inline mr-2" />
          紙のマークシートを採点
        </h2>

        {/* 試験選択 */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">試験を選択</label>
            <select
              value={selectedExamId}
              onChange={(e) => { setSelectedExamId(e.target.value); handleReset(); }}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">-- 試験を選んでください --</option>
              {pdfExams.map((e) => (
                <option key={e.id} value={e.id}>{e.title} ({e.questionCount}問)</option>
              ))}
            </select>
          </div>
          {!imageUrl && selectedExamId && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Upload size={16} /> 答案を撮影/アップロード
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        </div>

        {!selectedExamId && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] py-20 text-center">
            <Camera size={48} className="mx-auto text-[var(--muted)]" />
            <p className="mt-4 text-[var(--muted)]">上で試験を選択してから、紙の答案を撮影してください</p>
          </div>
        )}

        {selectedExamId && exam && (
          <div className="grid gap-4 lg:grid-cols-[4fr_1fr]">
            {/* 左: 答案写真 */}
            <div className="space-y-2">
              {imageUrl ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                  {/* ツールバー */}
                  <div className="flex items-center justify-between border-b bg-[var(--background)] px-3 py-1.5">
                    <span className="text-xs text-[var(--muted)]">答案画像</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]" title="縮小">
                        <ZoomOut size={14} />
                      </button>
                      <span className="text-xs text-[var(--muted)] w-10 text-center">{zoom}%</span>
                      <button onClick={() => setZoom((z) => Math.min(300, z + 25))} className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]" title="拡大">
                        <ZoomIn size={14} />
                      </button>
                      <button onClick={() => setZoom(100)} className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] ml-1" title="リセット">
                        <Move size={14} />
                      </button>
                      <button onClick={() => { setImageUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)] ml-2" title="削除">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {/* 画像表示（スクロール可） */}
                  <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    <img src={imageUrl} alt="答案" style={{ width: `${zoom}%` }} className="block" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--surface)] py-24 text-[var(--muted)] hover:border-blue-400 hover:text-blue-500 transition"
                >
                  <Camera size={48} className="mb-3" />
                  <p className="text-sm font-medium">タップして答案を撮影</p>
                  <p className="text-xs mt-1">またはファイルを選択</p>
                </div>
              )}
            </div>

            {/* 右: マークシート */}
            <div className="space-y-3">
              <MarkSheet
                questionCount={exam.questionCount}
                choiceCount={exam.choiceCount ?? 4}
                onAnswersChange={setMarkAnswers}
                results={markResults}
                answerKey={submitted ? exam.answerKey : undefined}
                readOnly={submitted}
                initialAnswers={markAnswers}
                examSections={examSections}
                onLapTimesChange={setLapTimes}
                lapTimes={submitted ? lapTimes : undefined}
              />

              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(markAnswers).length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-base font-bold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? "採点中..." : "採点する"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
                    <CheckCircle size={18} /> 採点完了！結果が保存されました
                  </div>
                  <button onClick={handleReset} className="w-full rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background)]">
                    別の答案を採点
                  </button>
                  <button onClick={() => router.push("/history")} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                    履歴を見る
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
