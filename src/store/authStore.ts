import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  initialized: boolean;

  setSession: (session: Session | null) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  initialized: false,

  setSession: async (session) => {
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ session, user: session.user, profile: data, initialized: true });
    } else {
      set({ session: null, user: null, profile: null, initialized: true });
    }
  },

  fetchProfile: async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) set({ profile: data });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    let profileData = null;
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profileData = profile;
    }
    set({ session: data.session, user: data.user, profile: profileData, initialized: true });
  },

  // src/store/authStore.ts

signUp: async (email, password, fullName, username) => {
  // 1. Auth Signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username.toLowerCase(),
      }
    }
  });
  if (error) throw error;

  // 2. IMPORTANT: Create the profile manually if no trigger exists
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: data.user.id, 
        username: username.toLowerCase(), 
        full_name: fullName 
      }]);

    if (profileError) {
      console.error("Profile creation failed:", profileError);
      throw profileError; // This stops the "success" state
    }
  }

  set({ session: data.session, user: data.user, initialized: true });
},

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, initialized: true });
  },
}));