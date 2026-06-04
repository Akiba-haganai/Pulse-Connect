import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";


interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;

  initialized: boolean;
  isLoading: boolean;

  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  setSession: (session: Session | null) => void;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => Promise<void>;

  signOut: () => Promise<void>;
}

let authListenerRegistered = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,

  initialized: false,
  isLoading: false,

  setLoading: (loading) => set({ isLoading: loading }),

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user) {
      set({
        user: null,
        session: null,
        profile: null,
        initialized: true,
      });
    } else {
      await get().fetchProfile(session.user.id);

      set({
        user: session.user,
        session,
        initialized: true,
      });
    }

    // ✅ ONLY ONE GLOBAL LISTENER
    if (!authListenerRegistered) {
      authListenerRegistered = true;

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          set({
            user: null,
            session: null,
            profile: null,
          });
          return;
        }

        await get().fetchProfile(session.user.id);

        set({
          user: session.user,
          session,
        });
      });
    }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) set({ profile: data });
  },

  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) await get().fetchProfile(data.user.id);

      set({
        session: data.session,
        user: data.user,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            full_name: fullName,
            username: username.toLowerCase(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username.toLowerCase(),
          full_name: fullName,
          role: "student",
        });

        await get().fetchProfile(data.user.id);
      }

      set({
        user: data.user ?? null,
        session: data.session ?? null,
        initialized: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();

    set({
      user: null,
      session: null,
      profile: null,
      initialized: true,
    });
  },
}));