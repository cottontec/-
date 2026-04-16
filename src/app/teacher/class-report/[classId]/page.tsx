"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth-context";
import { getClassById, getClassMembers } from "@/app/lib/teacher-storage";
import { getResultsByUserId } from "@/app/lib/storage";
import { getExamById } from "@/app/lib/data";
import { GRADE_INFO, GRADE_SECTIONS } from "@/app/lib/types";
import type { ClassRoom, ClassMember, QuizResult, Grade, ExamSection } from "@/app/lib/types";
import { ArrowLeft, Download, Table } from "lucide-react";

interface StudentRow {
  member: ClassMember;
  results: QuizResult[];
  latestResult?: QuizResult;
  avgPercentage: number;
  sectionAvgs: Record<string, number>; // 大問名→平均正答率
}

export default function ClassReportPage() {
  const { classId } = useParams();
  const id = classId as string;
  const { user } = useAuth();

  const [cls, setCls] = useState<ClassRoom | null>(null);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [allSections, setAllSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const c = await getClassById(id);
      setCls(c);
      const members = await getClassMembers(id);

      const sectionNamesSet = new Set<string>();
      const studentRows: StudentRow[] = [];

      for (const m of members) {
        const results = await getResultsByUserId(m.studentId);
        const avg = results.length > 0
          ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
          : 0;

        const sectionAvgs: Record<string, number> = {};
        const sectionTotals: Record<string, { sum: number; count: number }> = {};

        results.forEach((r) => {
          if (!r.sectionScores) return;
          r.sectionScores.forEach((ss) => {
            sectionNamesSet.add(ss.name);
            if (!sectionTotals[ss.name]) sectionTotals[ss.name] = { sum: 0, count: 0 };
            sectionTotals[ss.name].sum += ss.percentage;
            sectionTotals[ss.name].count += 1;
          });
        });

        Object.entries(sectionTotals).forEach(([name, { sum, count }]) => {
          sectionAvgs[name] = Math.round(sum / count);
        });

        studentRows.push({
          member: m,
          results,
          latestResult: results[0],
          avgPercentage: avg,
          sectionAvgs,
        });
      }

      setAllSections(Array.from(sectionNamesSet));
      setRows(studentRows.sort((a, b) => b.avgPercentage - a.avgPercentage));
      setLoading(false);
    })();
  }, [user, id]);

  const exportCsv = () => {
    const headers = ["生徒名", "受験回数", "平均正答率", ...allSections];
    const csvRows = rows.map((r) => [
      r.member.studentName,
      r.results.length,
      `${r.avgPercentage}%`,
      ...allSections.map((s) => r.sectionAvgs[s] ? `${r.sectionAvgs[s]}%` : "-"),
    ]);
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `成績一覧_${cls?.name ?? id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== "teacher") {
    return <div className="min-h-screen bg-gray-50"><Header /><div className="flex items-center justify-center py-32 text-gray-500">先生アカウントでログインしてください</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link href={`/teacher/class/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> クラス詳細に戻る
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            <Table size={22} className="inline mr-2" />
            {cls?.name ?? "クラス"} — 成績一覧表
          </h2>
          <button onClick={exportCsv} className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
            <Download size={16} /> CSV出力
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">読み込み中...</div>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">生徒名</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">回数</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">平均</th>
                  {allSections.map((s) => (
                    <th key={s} className="px-3 py-3 text-center font-semibold text-gray-700 whitespace-nowrap text-xs">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.member.studentId} className="hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-gray-900">
                      <Link href={`/teacher/student/${row.member.studentId}`} className="text-blue-600 hover:underline">
                        {row.member.studentName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">{row.results.length}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-bold ${row.avgPercentage >= 70 ? "text-green-600" : row.avgPercentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {row.avgPercentage}%
                      </span>
                    </td>
                    {allSections.map((s) => {
                      const val = row.sectionAvgs[s];
                      return (
                        <td key={s} className="px-3 py-2 text-center">
                          {val !== undefined ? (
                            <span className={`text-xs font-medium ${val >= 70 ? "text-green-600" : val >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                              {val}%
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">まだデータがありません</div>
        )}
      </main>
    </div>
  );
}
