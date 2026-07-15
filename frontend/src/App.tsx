import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import CityHeadRoute from "./components/CityHeadRoute";

import DashboardLayout from "./layouts/DashboardLayout";
import RegionalHeadLayout from "./layouts/RegionalHeadLayout";
import CityHeadLayout from "./layouts/CityheadLayout";

import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import Regionaldashboard from "./pages/dashboard/RegionalHeadDashboard";
import CityHeadDashboard from "./pages/dashboard/CityHeadDashboard";


import CreateUserPage from "./pages/users/CreateUserPage";
import EditUserPage from "./pages/users/EditUserPage";

import StudentsPage from "./pages/students/StudentsPage";
import CreateStudentPage from "./pages/students/CreateStudentPage";
import EditStudentPage from "./pages/students/EditStudentPage";
import LeadDetailsPage from "./pages/students/LeadDetailsPage";

const withLayout = (element: ReactElement) => (
  <ProtectedRoute>
    <DashboardLayout>{element}</DashboardLayout>
  </ProtectedRoute>
);

// Exported so route guards (e.g. CityHeadRoute) can reuse the same
// role -> home-path mapping instead of duplicating it.
export const homePathForRole = (role: string | undefined) => {
  switch (role) {
    case "super_admin":
      return "/dashboard";

    case "regional_head":
      return "/regional-head";

    case "city_head":
      return "/city-head";

    default:
      return "/";
  }
};

const RegionalHeadRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== "regional_head") {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={homePathForRole(user?.role)} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Regional Head */}

      <Route
        path="/regional-head"
        element={
          <RegionalHeadRoute>
            <RegionalHeadLayout />
          </RegionalHeadRoute>
        }
      >
        <Route index element={<Regionaldashboard />} />
        <Route path="leads" element={<StudentsPage />} />
        <Route path="leads/create" element={<CreateStudentPage />} />
        <Route path="leads/:id" element={<LeadDetailsPage />} />
        <Route path="leads/edit/:id" element={<EditStudentPage />} />
      </Route>

      {/* City Head */}

      <Route
        path="/city-head"
        element={
          <CityHeadRoute>
            <CityHeadLayout />
          </CityHeadRoute>
        }
      >
        <Route index element={<CityHeadDashboard />} />
        <Route path="leads" element={<StudentsPage />} />
        <Route path="leads/create" element={<CreateStudentPage />} />
        <Route path="leads/:id" element={<LeadDetailsPage />} />
        <Route path="leads/edit/:id" element={<EditStudentPage />} />
      </Route>

      {/* Super Admin Dashboard */}

      <Route
        path="/dashboard"
        element={withLayout(<DashboardPage />)}
      />

      {/* Employees — admin only */}

      <Route
        path="/users"
        element={withLayout(<UsersPage />)}
      />

      <Route
        path="/users/create"
        element={withLayout(<CreateUserPage />, ["super_admin", "co_admin"])}
      />

      <Route
        path="/users/edit/:id"
        element={withLayout(<EditUserPage />, ["super_admin", "co_admin"])}
      />

      {/* Leads — admin only (regional_head / city_head use their own /leads routes above) */}

      <Route
        path="/students"
        element={withLayout(<StudentsPage />, ["super_admin", "co_admin"])}
      />

      <Route
        path="/students/create"
        element={withLayout(<CreateStudentPage />, ["super_admin", "co_admin"])}
      />

      <Route
        path="/students/edit/:id"
        element={withLayout(<EditStudentPage />, ["super_admin", "co_admin"])}
      />

      <Route
        path="/students/:id"
        element={withLayout(<LeadDetailsPage />, ["super_admin", "co_admin"])}
      />

      {/* Redirect */}

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? homePathForRole(user?.role) : "/"}
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;