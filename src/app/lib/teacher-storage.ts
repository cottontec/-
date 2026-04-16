"use client";

import type { ClassRoom, ClassMember, Assignment } from "./types";
import { isSupabaseConfigured } from "./storage";

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const LS_CLASSES_KEY = "eiken_classes";
const LS_MEMBERS_KEY_PREFIX = "eiken_members_";
const LS_ASSIGNMENTS_KEY_PREFIX = "eiken_assignments_";

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

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ---------------------------------------------------------------------------
// createClass
// ---------------------------------------------------------------------------

export async function createClass(
  name: string,
  teacherId: string
): Promise<ClassRoom> {
  const now = new Date().toISOString();
  const inviteCode = generateInviteCode();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("classes")
        .insert({
          name,
          teacher_id: teacherId,
          invite_code: inviteCode,
          created_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        name: row.name as string,
        teacherId: row.teacher_id as string,
        inviteCode: row.invite_code as string,
        createdAt: row.created_at as string,
      };
    } catch {
      // Fall through to localStorage
    }
  }

  const classroom: ClassRoom = {
    id: crypto.randomUUID(),
    name,
    teacherId,
    inviteCode,
    createdAt: now,
  };

  const classes = lsGet<ClassRoom[]>(LS_CLASSES_KEY) ?? [];
  classes.push(classroom);
  lsSet(LS_CLASSES_KEY, classes);

  return classroom;
}

// ---------------------------------------------------------------------------
// getClasses
// ---------------------------------------------------------------------------

export async function getClasses(teacherId: string): Promise<ClassRoom[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacherId);

      if (error) throw error;

      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: row.name as string,
        teacherId: row.teacher_id as string,
        inviteCode: row.invite_code as string,
        createdAt: row.created_at as string,
      }));
    } catch {
      // Fall through to localStorage
    }
  }

  const classes = lsGet<ClassRoom[]>(LS_CLASSES_KEY) ?? [];
  return classes.filter((c) => c.teacherId === teacherId);
}

// ---------------------------------------------------------------------------
// getClassById
// ---------------------------------------------------------------------------

export async function getClassById(
  classId: string
): Promise<ClassRoom | null> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) throw error;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        name: row.name as string,
        teacherId: row.teacher_id as string,
        inviteCode: row.invite_code as string,
        createdAt: row.created_at as string,
      };
    } catch {
      // Fall through to localStorage
    }
  }

  const classes = lsGet<ClassRoom[]>(LS_CLASSES_KEY) ?? [];
  return classes.find((c) => c.id === classId) ?? null;
}

// ---------------------------------------------------------------------------
// addStudent
// ---------------------------------------------------------------------------

export async function addStudent(
  classId: string,
  studentId: string,
  studentName: string
): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("class_members").insert({
        class_id: classId,
        student_id: studentId,
        student_name: studentName,
        joined_at: now,
      });
      if (error) throw error;
      return;
    } catch {
      // Fall through to localStorage
    }
  }

  const key = `${LS_MEMBERS_KEY_PREFIX}${classId}`;
  const members = lsGet<ClassMember[]>(key) ?? [];
  members.push({
    classId,
    studentId,
    studentName,
    joinedAt: now,
  });
  lsSet(key, members);
}

// ---------------------------------------------------------------------------
// getClassMembers
// ---------------------------------------------------------------------------

export async function getClassMembers(
  classId: string
): Promise<ClassMember[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("class_members")
        .select("*")
        .eq("class_id", classId);

      if (error) throw error;

      return (data ?? []).map((row: Record<string, unknown>) => ({
        classId: row.class_id as string,
        studentId: row.student_id as string,
        studentName: row.student_name as string,
        joinedAt: row.joined_at as string,
      }));
    } catch {
      // Fall through to localStorage
    }
  }

  return lsGet<ClassMember[]>(`${LS_MEMBERS_KEY_PREFIX}${classId}`) ?? [];
}

// ---------------------------------------------------------------------------
// createAssignment
// ---------------------------------------------------------------------------

export async function createAssignment(
  classId: string,
  examId: string,
  title: string,
  dueDate: string | null
): Promise<Assignment> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          class_id: classId,
          exam_id: examId,
          title,
          due_date: dueDate,
          created_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      const row = data as Record<string, unknown>;
      return {
        id: row.id as string,
        classId: row.class_id as string,
        examId: row.exam_id as string,
        title: row.title as string,
        dueDate: (row.due_date as string) ?? null,
        createdAt: row.created_at as string,
      };
    } catch {
      // Fall through to localStorage
    }
  }

  const assignment: Assignment = {
    id: crypto.randomUUID(),
    classId,
    examId,
    title,
    dueDate,
    createdAt: now,
  };

  const key = `${LS_ASSIGNMENTS_KEY_PREFIX}${classId}`;
  const assignments = lsGet<Assignment[]>(key) ?? [];
  assignments.push(assignment);
  lsSet(key, assignments);

  return assignment;
}

// ---------------------------------------------------------------------------
// getAssignments
// ---------------------------------------------------------------------------

export async function getAssignments(
  classId: string
): Promise<Assignment[]> {
  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("class_id", classId);

      if (error) throw error;

      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        classId: row.class_id as string,
        examId: row.exam_id as string,
        title: row.title as string,
        dueDate: (row.due_date as string) ?? null,
        createdAt: row.created_at as string,
      }));
    } catch {
      // Fall through to localStorage
    }
  }

  return (
    lsGet<Assignment[]>(`${LS_ASSIGNMENTS_KEY_PREFIX}${classId}`) ?? []
  );
}

// ---------------------------------------------------------------------------
// joinClassByCode
// ---------------------------------------------------------------------------

export async function joinClassByCode(
  inviteCode: string,
  studentId: string,
  studentName: string
): Promise<ClassRoom> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();

      // Find the class by invite code
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("invite_code", inviteCode)
        .single();

      if (classError) throw classError;

      const row = classData as Record<string, unknown>;
      const classroom: ClassRoom = {
        id: row.id as string,
        name: row.name as string,
        teacherId: row.teacher_id as string,
        inviteCode: row.invite_code as string,
        createdAt: row.created_at as string,
      };

      // Add the student as a member
      const { error: memberError } = await supabase
        .from("class_members")
        .insert({
          class_id: classroom.id,
          student_id: studentId,
          student_name: studentName,
          joined_at: now,
        });

      if (memberError) throw memberError;

      return classroom;
    } catch {
      // Fall through to localStorage
    }
  }

  // localStorage path: find class by invite code
  const classes = lsGet<ClassRoom[]>(LS_CLASSES_KEY) ?? [];
  const classroom = classes.find((c) => c.inviteCode === inviteCode);

  if (!classroom) {
    throw new Error("Invalid invite code");
  }

  // Add the student as a member
  const key = `${LS_MEMBERS_KEY_PREFIX}${classroom.id}`;
  const members = lsGet<ClassMember[]>(key) ?? [];
  members.push({
    classId: classroom.id,
    studentId,
    studentName,
    joinedAt: now,
  });
  lsSet(key, members);

  return classroom;
}
