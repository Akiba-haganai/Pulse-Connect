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

  signUp: async (email, password, fullName, username) => {
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
    set({ session: data.session, user: data.user, initialized: true });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, initialized: true });
  },
}));