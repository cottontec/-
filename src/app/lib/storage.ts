"use client";

import type { QuizResult, UserProfile } from "./types";

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
