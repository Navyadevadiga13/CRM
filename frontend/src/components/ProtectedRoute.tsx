import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const homePathForRole = (role: string | undefined) => {
  if (role === "regional_head") return "/regional-head";
  return "/dashboard";
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;