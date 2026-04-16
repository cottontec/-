"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface ParsedQuestion {
  examId: string;
  number: number;
  text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctAnswer: string;
  explanation: string;
}

export default function ImportPage() {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<ParsedQuestion[]>([]);
  const [imported, setImported] = useState(false);

  const handleParse = () => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return;

    const rows: ParsedQuestion[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length < 9) continue;
      rows.push({
        examId: cols[0],
        number: parseInt(cols[1]) || i,
        text: cols[2],
        choice1: cols[3],
        choice2: cols[4],
        choice3: cols[5],
        choice4: cols[6],
        correctAnswer: cols[7],
        explanation: cols[8] ?? "",
      });
    }
    setParsed(rows);
  };

  const handleImport = () => {
    // localStorage に保存（デモ用）
    const existing = JSON.parse(localStorage.getItem("eiken_imported_questions") ?? "[]");
    const newQuestions = parsed.map((p) => ({
      id: `${p.examId}-q${p.number}`,
      examId: p.examId,
      number: p.number,
      type: "vocabulary",
      text: p.text,
      choices: [
        { label: "1", text: p.choice1 },
        { label: "2", text: p.choice2 },
        { label: "3", text: p.choice3 },
        { label: "4", text: p.choice4 },
      ],
      correctAnswer: p.correctAnswer,
      explanation: p.explanation,
      points: 1,
    }));
    localStorage.setItem("eiken_imported_questions", JSON.stringify([...existing, ...newQuestions]));
    setImported(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">CSV問題インポート</h2>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Upload size={20} /> CSVフォーマット
          </h3>
          <div className="mb-4 rounded bg-gray-50 p-3 font-mono text-xs text-gray-700">
            examId,number,text,choice1,choice2,choice3,choice4,correctAnswer,explanation
          </div>
          <p className="mb-4 text-sm text-gray-600">
            examIdは <code className="rounded bg-gray-100 px-1">{"{grade}-{year}-{session}"}</code> 形式（例: 3kyu-2024-1）
          </p>

          <textarea
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setParsed([]); setImported(false); }}
            className="mb-4 w-full rounded-md border px-3 py-2 font-mono text-sm"
            rows={8}
            placeholder="CSVデータを貼り付けてください..."
          />

          <div className="flex gap-2">
            <button onClick={handleParse} disabled={!csvText.trim()} className="flex items-center gap-1 rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50">
              <FileText size={16} /> プレビュー
            </button>
            {parsed.length > 0 && !imported && (
              <button onClick={handleImport} className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                <Upload size={16} /> インポート ({parsed.length}問)
              </button>
            )}
          </div>
        </div>

        {imported && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle size={20} /> {parsed.length}問をインポートしました
          </div>
        )}

        {parsed.length > 0 && !imported && (
          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">プレビュー ({parsed.length}問)</h3>
            <div className="space-y-2">
              {parsed.slice(0, 5).map((p, i) => (
                <div key={i} className="rounded-lg border bg-white p-3 text-sm">
                  <p className="font-medium text-gray-900">[{p.examId}] 第{p.number}問</p>
                  <p className="text-gray-700">{p.text}</p>
                  <p className="text-xs text-gray-500">正解: {p.correctAnswer}</p>
                </div>
              ))}
              {parsed.length > 5 && <p className="text-sm text-gray-400">...他 {parsed.length - 5}問</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
