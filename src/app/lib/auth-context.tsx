"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile, UserRole } from "./types";
import { isSupabaseConfigured } from "./storage";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "eiken_current_user";
const PROFILES_KEY = "eiken_user_profiles";

// ---------------------------------------------------------------------------
// Helper: localStorage-based demo auth
// ---------------------------------------------------------------------------

function getDemoProfiles(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDemoProfiles(profiles: UserProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getDemoCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setDemoCurrentUser(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      // --- Supabase mode ---
      import("./supabase/client").then(({ createClient }) => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const u = session.user;
            setUser({
              id: u.id,
              displayName:
                (u.user_metadata?.display_name as string) || u.email || "",
              email: u.email || "",
              role: (u.user_metadata?.role as UserRole) || "student",
              createdAt: u.created_at,
            });
          }
          setLoading(false);
        });

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            setUser({
              id: u.id,
              displayName:
                (u.user_metadata?.display_name as string) || u.email || "",
              email: u.email || "",
              role: (u.user_metadata?.role as UserRole) || "student",
              createdAt: u.created_at,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      });
    } else {
      // --- Demo mode (localStorage) ---
      setUser(getDemoCurrentUser());
      setLoading(false);
    }
  }, []);

  // ---------- signIn ----------
  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // onAuthStateChange will update `user`
    } else {
      // Demo: find profile by email
      const profiles = getDemoProfiles();
      const found = profiles.find((p) => p.email === email);
      if (!found) {
        throw new Error("ユーザーが見つかりません");
      }
      setDemoCurrentUser(found);
      setUser(found);
    }
  };

  // ---------- signUp ----------
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => {
    if (isSupabaseConfigured()) {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, role },
        },
      });
      if (error) throw error;
    } else {
      // Demo: create profile in localStorage
      const profiles = getDemoProfiles();
      if (profiles.some((p) => p.email === email)) {
        throw new Error("このメールアドレスは既に登録されています");
      }
      const profile: UserProfile = {
        id: crypto.randomUUID(),
        displayName,
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      profiles.push(profile);
      saveDemoProfiles(profiles);
      setDemoCurrentUser(profile);
      setUser(profile);
    }
  };

  // ---------- signOut ----------
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      // onAuthStateChange will clear `user`
    } else {
      setDemoCurrentUser(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
