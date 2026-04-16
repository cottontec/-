"use client";

import type { QuizResult, UserProfile, CounselingNote, AppNotification, ExamExplanation, TeachingPoint } from "./types";

/**
 * Returns true if Supabase environment variables are configured
 * with real values (not placeholders).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !!url &&
    !!key &&
    url !== "your-supabase-url" &&
    key !== "your-supabase-anon-key"
  );
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const LS_RESULTS_KEY = "eiken_results";
const LS_PROFILE_KEY_PREFIX = "eiken_profile_";
const DEFAULT_USER_ID = "local-user";

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function lsSet(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// saveResult
// ---------------------------------------------------------------------------

export async function saveResult(result: QuizResult): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("test_results").insert({
        id: result.id,
        exam_id: result.examId,
        user_id: result.userId,
        answers: result.answers,
        score: result.score,
        total_points: result.totalPoints,
        percentage: result.percentage,
        time_spent_seconds: result.timeSpentSeconds,
        completed_at: result.completedAt,
      });
      if (error) throw error;
      return;
    } catch {
      // Fall through to localStorage
    }
  }

  const results = lsGet<QuizResult[]>(LS_RESULTS_KEY) ?? [];
  results.unshift(result);
  lsSet(LS_RESULTS_KEY, results);
}

// ---------------------------------------------------------------------------
// getResults
// ---------------------------------------------------------------------------

export async function getResults(userId?: string): Promise<QuizResult[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      let query = supabase
        .from("test_results")
        .select("*")
        .order("completed_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        examId: row.exam_id as string,
        userId: row.user_id as string,
        answers: row.answers as QuizResult["answers"],
        score: row.score as number,
        totalPoints: row.total_points as number,
        percentage: row.percentage as number,
        timeSpentSeconds: row.time_spent_seconds as number,
        completedAt: row.completed_at as string,
      }));
    } catch {
      // Fall through to localStorage
    }
  }

  const results = lsGet<QuizResult[]>(LS_RESULTS_KEY) ?? [];
  const effectiveUserId = userId ?? DEFAULT_USER_ID;

  const filtered = results.filter((r) => r.userId === effectiveUserId);
  filtered.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  return filtered;
}

// ---------------------------------------------------------------------------
// getResultById
// ---------------------------------------------------------------------------

export async function getResultById(id: string): Promise<QuizResult | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        examId: row.exam_id as string,
        userId: row.user_id as string,
        answers: row.answers as QuizResult["answers"],
        score: row.score as number,
        totalPoints: row.total_points as number,
        percentage: row.percentage as number,
        timeSpentSeconds: row.time_spent_seconds as number,
        completedAt: row.completed_at as string,
      };
    } catch {
      // Fall through to localStorage
    }
  }

  const results = lsGet<QuizResult[]>(LS_RESULTS_KEY) ?? [];
  return results.find((r) => r.id === id) ?? null;
}

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------

export async function getProfile(
  userId: string
): Promise<UserProfile | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        displayName: row.display_name as string,
        email: row.email as string,
        role: row.role as UserProfile["role"],
        targetGrade: row.target_grade as UserProfile["targetGrade"],
        createdAt: row.created_at as string,
      };
    } catch {
      // Fall through to localStorage
    }
  }

  return lsGet<UserProfile>(`${LS_PROFILE_KEY_PREFIX}${userId}`);
}

// ---------------------------------------------------------------------------
// saveProfile
// ---------------------------------------------------------------------------

export async function saveProfile(profile: UserProfile): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("user_profiles").upsert({
        id: profile.id,
        display_name: profile.displayName,
        email: profile.email,
        role: profile.role,
        target_grade: profile.targetGrade ?? null,
        created_at: profile.createdAt,
      });
      if (error) throw error;
      return;
    } catch {
      // Fall through to localStorage
    }
  }

  lsSet(`${LS_PROFILE_KEY_PREFIX}${profile.id}`, profile);
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export interface Bookmark {
  questionId: string;
  examId: string;
  note: string;
  createdAt: string;
}

const LS_BOOKMARKS_KEY = "eiken_bookmarks";

export async function getBookmarks(userId?: string): Promise<Bookmark[]> {
  if (isSupabaseConfigured() && userId) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: Record<string, unknown>) => ({
        questionId: row.question_id as string,
        examId: row.exam_id as string,
        note: (row.note as string) ?? "",
        createdAt: row.created_at as string,
      }));
    } catch { /* fall through */ }
  }
  return lsGet<Bookmark[]>(LS_BOOKMARKS_KEY) ?? [];
}

export async function addBookmark(userId: string, bookmark: Bookmark): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      await supabase.from("user_bookmarks").upsert({
        user_id: userId,
        question_id: bookmark.questionId,
        exam_id: bookmark.examId,
        note: bookmark.note,
        created_at: bookmark.createdAt,
      });
      return;
    } catch { /* fall through */ }
  }
  const bookmarks = lsGet<Bookmark[]>(LS_BOOKMARKS_KEY) ?? [];
  const idx = bookmarks.findIndex((b) => b.questionId === bookmark.questionId);
  if (idx >= 0) bookmarks[idx] = bookmark;
  else bookmarks.unshift(bookmark);
  lsSet(LS_BOOKMARKS_KEY, bookmarks);
}

export async function removeBookmark(userId: string, questionId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      await supabase.from("user_bookmarks").delete().eq("user_id", userId).eq("question_id", questionId);
      return;
    } catch { /* fall through */ }
  }
  const bookmarks = lsGet<Bookmark[]>(LS_BOOKMARKS_KEY) ?? [];
  lsSet(LS_BOOKMARKS_KEY, bookmarks.filter((b) => b.questionId !== questionId));
}

export async function isBookmarked(userId: string, questionId: string): Promise<boolean> {
  const bookmarks = await getBookmarks(userId);
  return bookmarks.some((b) => b.questionId === questionId);
}

// ---------------------------------------------------------------------------
// 全ユーザーの結果取得（先生用）
// ---------------------------------------------------------------------------

export async function getAllResults(): Promise<QuizResult[]> {
  const results = lsGet<QuizResult[]>(LS_RESULTS_KEY) ?? [];
  results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  return results;
}

export async function getResultsByUserId(userId: string): Promise<QuizResult[]> {
  const results = lsGet<QuizResult[]>(LS_RESULTS_KEY) ?? [];
  return results
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

// ---------------------------------------------------------------------------
// カウンセリングノート
// ---------------------------------------------------------------------------

const LS_COUNSELING_KEY = "eiken_counseling";

export async function getCounselingNotes(studentId: string): Promise<CounselingNote[]> {
  const all = lsGet<CounselingNote[]>(LS_COUNSELING_KEY) ?? [];
  return all
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveCounselingNote(note: CounselingNote): Promise<void> {
  const all = lsGet<CounselingNote[]>(LS_COUNSELING_KEY) ?? [];
  all.unshift(note);
  lsSet(LS_COUNSELING_KEY, all);
}

// ---------------------------------------------------------------------------
// 通知
// ---------------------------------------------------------------------------

const LS_NOTIFICATIONS_KEY = "eiken_notifications";

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const all = lsGet<AppNotification[]>(LS_NOTIFICATIONS_KEY) ?? [];
  return all
    .filter((n) => n.recipientId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getUnreadCount(userId: string): Promise<number> {
  const notes = await getNotifications(userId);
  return notes.filter((n) => !n.read).length;
}

export async function addNotification(notification: AppNotification): Promise<void> {
  const all = lsGet<AppNotification[]>(LS_NOTIFICATIONS_KEY) ?? [];
  all.unshift(notification);
  lsSet(LS_NOTIFICATIONS_KEY, all);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const all = lsGet<AppNotification[]>(LS_NOTIFICATIONS_KEY) ?? [];
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx >= 0) { all[idx].read = true; lsSet(LS_NOTIFICATIONS_KEY, all); }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const all = lsGet<AppNotification[]>(LS_NOTIFICATIONS_KEY) ?? [];
  all.forEach((n) => { if (n.recipientId === userId) n.read = true; });
  lsSet(LS_NOTIFICATIONS_KEY, all);
}

/** 生徒が提出したときに先生へ通知を送る */
export async function notifyTeachersOfSubmission(
  studentId: string,
  studentName: string,
  examTitle: string,
  resultId: string,
  percentage: number,
): Promise<void> {
  // 先生のクラスを探して通知
  const classesRaw = localStorage.getItem("eiken_classes");
  if (!classesRaw) return;
  const classes = JSON.parse(classesRaw) as { id: string; teacherId: string }[];

  const notifiedTeachers = new Set<string>();

  for (const cls of classes) {
    const membersKey = `eiken_members_${cls.id}`;
    const members = lsGet<{ studentId: string }[]>(membersKey) ?? [];
    const isMember = members.some((m) => m.studentId === studentId);
    if (isMember && !notifiedTeachers.has(cls.teacherId)) {
      notifiedTeachers.add(cls.teacherId);
      await addNotification({
        id: `notif-${new Date().getTime()}-${cls.teacherId}`,
        recipientId: cls.teacherId,
        type: "submission",
        title: "過去問提出",
        message: `${studentName}さんが「${examTitle}」を提出しました（${percentage}%）`,
        link: `/teacher/student/${studentId}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 解説コンテンツ
// ---------------------------------------------------------------------------

const LS_EXPLANATIONS_KEY = "eiken_explanations";

export async function getExplanation(examId: string): Promise<ExamExplanation | null> {
  const all = lsGet<ExamExplanation[]>(LS_EXPLANATIONS_KEY) ?? [];
  return all.find((e) => e.examId === examId) ?? null;
}

export async function saveExplanation(explanation: ExamExplanation): Promise<void> {
  const all = lsGet<ExamExplanation[]>(LS_EXPLANATIONS_KEY) ?? [];
  const idx = all.findIndex((e) => e.examId === explanation.examId);
  if (idx >= 0) all[idx] = explanation;
  else all.push(explanation);
  lsSet(LS_EXPLANATIONS_KEY, all);
}

// ---------------------------------------------------------------------------
// 指導ポイント（先生のみ）
// ---------------------------------------------------------------------------

const LS_TEACHING_POINTS_KEY = "eiken_teaching_points";

export async function getTeachingPoint(examId: string): Promise<TeachingPoint | null> {
  const all = lsGet<TeachingPoint[]>(LS_TEACHING_POINTS_KEY) ?? [];
  return all.find((t) => t.examId === examId) ?? null;
}

export async function saveTeachingPoint(point: TeachingPoint): Promise<void> {
  const all = lsGet<TeachingPoint[]>(LS_TEACHING_POINTS_KEY) ?? [];
  const idx = all.findIndex((t) => t.examId === point.examId);
  if (idx >= 0) all[idx] = point;
  else all.push(point);
  lsSet(LS_TEACHING_POINTS_KEY, all);
}
