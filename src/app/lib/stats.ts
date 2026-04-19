import type { QuizResult, Grade } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 連続学習日数（今日 or 昨日に学習があれば継続中） */
export function calcStreakDays(results: QuizResult[]): number {
  if (results.length === 0) return 0;

  const dayKeys = new Set(results.map((r) => toLocalDateKey(new Date(r.completedAt))));
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const yesterdayKey = toLocalDateKey(new Date(today.getTime() - MS_PER_DAY));

  if (!dayKeys.has(todayKey) && !dayKeys.has(yesterdayKey)) return 0;

  let streak = 0;
  let cursor = new Date(today);
  if (!dayKeys.has(todayKey)) cursor = new Date(today.getTime() - MS_PER_DAY);

  while (dayKeys.has(toLocalDateKey(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }
  return streak;
}

/** 直近N日間の学習秒数合計 */
export function studySecondsInLastDays(results: QuizResult[], days: number): number {
  const cutoff = Date.now() - days * MS_PER_DAY;
  return results
    .filter((r) => new Date(r.completedAt).getTime() >= cutoff)
    .reduce((sum, r) => sum + (r.timeSpentSeconds ?? 0), 0);
}

/** 直近N日間の解答試験数 */
export function attemptsInLastDays(results: QuizResult[], days: number): number {
  const cutoff = Date.now() - days * MS_PER_DAY;
  return results.filter((r) => new Date(r.completedAt).getTime() >= cutoff).length;
}

/** 全結果の平均正答率（自動採点された結果のみ対象、自己採点・ライティングは除外） */
export function averagePercentage(results: QuizResult[]): number {
  const scored = results.filter((r) => r.totalPoints > 0 && (r.mode ?? "full") !== "writing");
  if (scored.length === 0) return 0;
  const total = scored.reduce((sum, r) => sum + r.percentage, 0);
  return Math.round((total / scored.length) * 10) / 10;
}

/** 直近に最も多くチャレンジした級 */
export function mostFrequentGrade(results: QuizResult[]): Grade | null {
  if (results.length === 0) return null;
  const count = new Map<Grade, number>();
  for (const r of results) {
    const grade = r.examId.split("-")[0] as Grade;
    count.set(grade, (count.get(grade) ?? 0) + 1);
  }
  let best: Grade | null = null;
  let max = 0;
  for (const [g, c] of count) {
    if (c > max) {
      max = c;
      best = g;
    }
  }
  return best;
}

/** 学習時間を「Xh Ym」 or 「Ym」 で整形 */
export function formatStudyTime(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}分`;
  const h = Math.floor(m / 60);
  return `${h}時間${m % 60}分`;
}

/** 直近の結果（最大N件） */
export function recentResults(results: QuizResult[], n: number): QuizResult[] {
  return [...results]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, n);
}

/** 過去90日のヒートマップ用データ（日付キー→学習件数） */
export function buildActivityHeatmap(results: QuizResult[], days = 90): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of results) {
    const key = toLocalDateKey(new Date(r.completedAt));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * MS_PER_DAY);
    const key = toLocalDateKey(d);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}
