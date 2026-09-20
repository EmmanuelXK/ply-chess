"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { supabasePublicConfig } from "@/lib/supabase/env";
import { loadProfile, saveProfile, type ClubProfile } from "@/lib/auth/profile";
import type { ProfileDraft } from "@/lib/auth/sanitize";
import {
  adoptAnonIfNeeded,
  getProgressUser,
  pullRemoteProgress,
  pushRemoteProgress,
  setProgressDirtyHandler,
  setProgressUser,
} from "@/lib/reps/schedule";

interface AuthValue {
  configured: boolean;
  ready: boolean;
  user: User | null;
  profile: ClubProfile | null;
  save: (draft: ProfileDraft) => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  configured: false,
  ready: true,
  user: null,
  profile: null,
  save: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = supabasePublicConfig().configured;
  const [ready, setReady] = useState(!configured);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ClubProfile | null>(null);

  const hydrate = useCallback(async (next: User | null) => {
    setUser(next);
    setProgressUser(next?.id ?? null);
    if (!next) {
      setProfile(null);
      return;
    }
    adoptAnonIfNeeded(next.id);
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    try {
      const row = await loadProfile(supabase, next);
      setProfile(row);
      await pullRemoteProgress(supabase, next.id);
    } catch {
      /* Local profile/progress still work if tables are not applied yet. */
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setProgressUser(null);
      return;
    }
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      void hydrate(data.user ?? null).finally(() => {
        if (!cancelled) setReady(true);
      });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user ?? null);
    });
    setProgressDirtyHandler(() => {
      const client = createBrowserSupabase();
      const id = getProgressUser();
      if (client && id) void pushRemoteProgress(client, id);
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
      setProgressDirtyHandler(null);
    };
  }, [configured, hydrate]);

  const save = useCallback(
    async (draft: ProfileDraft) => {
      if (!user) return;
      const supabase = createBrowserSupabase();
      if (!supabase) return;
      const next = await saveProfile(supabase, user.id, draft);
      setProfile(next);
    },
    [user],
  );

  const value = useMemo(
    () => ({ configured, ready, user, profile, save }),
    [configured, ready, user, profile, save],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

