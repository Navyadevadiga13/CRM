import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { PropsWithChildren } from "react";

export default function ProtectedRoute({
  children,
}: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}