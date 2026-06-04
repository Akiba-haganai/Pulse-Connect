import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * RoleProtectedRoute
 * Wraps route elements and only renders them when the authenticated user
 * has the required role. Otherwise redirects to `fallbackPath`.
 */
export default function RoleProtectedRoute({
  requiredRole,
  fallbackPath = "/",
  children,
}: {
  /** Role that the user must have (e.g. "admin" or "professor") */
  requiredRole: string;
  /** Where to redirect if the role check fails */
  fallbackPath?: string;
  /** Elements to render when access is allowed */
  children: React.ReactNode;
}) {
  const { profile, initialized } = useAuthStore();

  if (!initialized) {
    // While auth state is loading, show a minimal loading placeholder.
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  // If the user is not logged in or lacks a profile, fall back.
  if (!profile) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Role check – allow if profile.role matches the required role.
  if (profile.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // All good – render children.
  return <>{children}</>;
}
