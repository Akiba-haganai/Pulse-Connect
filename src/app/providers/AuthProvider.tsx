import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    // 1. Check active session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes (like signing in, signing out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}