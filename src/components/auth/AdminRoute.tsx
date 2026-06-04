import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = useAuthStore((s) => s.profile);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-indigo-600 font-medium">
        Verifying permissions...
      </div>
    );
  }

  if (!profile) return null;

  if (profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}