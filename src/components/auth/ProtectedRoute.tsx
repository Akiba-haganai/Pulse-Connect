import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  // If Supabase hasn't finished checking the local session yet, show a loader
  if (!initialized) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-indigo-600 font-medium">
        Loading...
      </div>
    );
  }

  // If they are done loading but have no active user session, boot them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If they pass both checks, render the protected page!
  return <>{children}</>;
}