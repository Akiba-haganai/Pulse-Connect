import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const isLoading = useAuthStore((s) => s.isLoading);

  // 🔒 BLOCK RENDER UNTIL AUTH IS FULLY READY
  if (!initialized || isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-indigo-600 text-sm">
        Loading session...
      </div>
    );
  }

  // 🚫 NOT LOGGED IN → REDIRECT
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ AUTH SAFE
  return <>{children}</>;
}