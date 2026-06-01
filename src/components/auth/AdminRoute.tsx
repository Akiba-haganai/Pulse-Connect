import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);

  // 1. Wait for Supabase to finish checking the session and profile
  if (!initialized) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-indigo-600 font-medium">
        Verifying permissions...
      </div>
    );
  }

  // 2. If they are not logged in OR their role is not 'admin', kick them to the home feed
  if (!profile || profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. If they pass, render the admin page!
  return <>{children}</>;
}