"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getResults } from "@/app/lib/storage";
import { GRADE_INFO, GRADES } from "@/app/lib/types";
import type { Grade, QuizResult } from "@/app/lib/types";
import { Target, TrendingUp, Trophy } from "lucide-react";

interface GoalData {
  grade: Grade;
  targetPercentage: number;
}

const LS_GOALS_KEY = "eiken_goals";

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editValue, setEditValue] = useState(80);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = await getResults(user.id);
      setResults(r);
      const saved = localStorage.getItem(LS_GOALS_KEY);
      if (saved) setGoals(JSON.parse(saved));
      setLoading(false);
    })();
  }, [user]);

  const saveGoal = (grade: Grade, target: number) => {
    const newGoals = goals.filter((g) => g.grade !== grade);
    newGoals.push({ grade, targetPercentage: target });
    setGoals(newGoals);
    localStorage.setItem(LS_GOALS_KEY, JSON.stringify(newGoals));
    setEditingGrade(null);
  };

  const getGradeResults = (grade: Grade) =>
    results.filter((r) => r.examId.startsWith(grade));

  const getLatestPercentage = (grade: Grade) => {
    const gr = getGradeResults(grade);
    return gr.length > 0 ? gr[0].percentage : null;
  };

  const getAvgPercentage = (grade: Grade) => {
    const gr = getGradeResults(grade);
    return gr.length > 0 ? Math.round(gr.reduce((s, r) => s + r.percentage, 0) / gr.length) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          <Target size={24} className="inline mr-2 text-blue-600" /> 目標設定
        </h2>

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-4">
            {GRADES.map((grade) => {
              const info = GRADE_INFO[grade];
              const goal = goals.find((g) => g.grade === grade);
              const latest = getLatestPercentage(grade);
              const avg = getAvgPercentage(grade);
              const gradeResults = getGradeResults(grade);
              const isEditing = editingGrade === grade;
              const achieved = goal && latest !== null && latest >= goal.targetPercentage;

              return (
                <div key={grade} className={`rounded-lg border bg-white p-5 ${achieved ? "border-green-300 bg-green-50" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-full text-white text-sm font-bold ${info.bgColor}`}>
                        {info.label.replace("級", "")}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{info.label}</h3>
                        <p className="text-xs text-gray-500">受験{gradeResults.length}回</p>
                      </div>
                    </div>
                    {achieved && <Trophy size={20} className="text-yellow-500" />}
                  </div>

                  {/* 成績 */}
                  <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                    <div className="rounded bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">最新</p>
                      <p className="text-lg font-bold text-gray-900">{latest !== null ? `${latest}%` : "-"}</p>
                    </div>
                    <div className="rounded bg-gray-50 p-2">
                      <p className="text-xs text-gray-500">平均</p>
                      <p className="text-lg font-bold text-gray-900">{avg !== null ? `${avg}%` : "-"}</p>
                    </div>
                    <div className="rounded bg-blue-50 p-2">
                      <p className="text-xs text-blue-600">目標</p>
                      <p className="text-lg font-bold text-blue-600">{goal ? `${goal.targetPercentage}%` : "未設定"}</p>
                    </div>
                  </div>

                  {/* 達成率バー */}
                  {goal && latest !== null && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">達成率</span>
                        <span className={`font-bold ${achieved ? "text-green-600" : "text-blue-600"}`}>
                          {Math.min(100, Math.round((latest / goal.targetPercentage) * 100))}%
                          {achieved && " 達成!"}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200">
                        <div
                          className={`h-3 rounded-full transition-all ${achieved ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(100, (latest / goal.targetPercentage) * 100)}%` }}
                        />
                      </div>
                      {!achieved && goal.targetPercentage - latest > 0 && (
                        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                          <TrendingUp size={12} /> あと{Math.round(goal.targetPercentage - latest)}%で目標達成
                        </p>
                      )}
                    </div>
                  )}

                  {/* 目標設定 */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} max={100} value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} className="w-20 rounded border px-2 py-1 text-sm" />
                      <span className="text-sm text-gray-600">%</span>
                      <button onClick={() => saveGoal(grade, editValue)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">設定</button>
                      <button onClick={() => setEditingGrade(null)} className="rounded border px-3 py-1 text-sm text-gray-600">キャンセル</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingGrade(grade); setEditValue(goal?.targetPercentage ?? 80); }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {goal ? "目標を変更" : "目標を設定する"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
