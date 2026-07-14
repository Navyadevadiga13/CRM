import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import RegionalHeadLayout from "./layouts/RegionalHeadLayout";

import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import Regionaldashboard from "./pages/dashboard/RegionalHeadDashboard";

import UsersPage from "./pages/users/UsersPage";
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

// Where a logged-in user should land, based on role. Add more role -> path
// mappings here as new role-specific homes are built.
const homePathForRole = (role: string | undefined) => {
  if (role === "regional_head") return "/regional-head";
  return "/dashboard";
};

// Guards the entire /regional-head/* branch: must be logged in AND be a
// regional_head. Anyone else (including other authenticated roles) gets
// bounced to their own home instead of seeing this area.
const RegionalHeadRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== "regional_head") return <Navigate to={homePathForRole(user?.role)} replace />;
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

      {/* Regional head home — Dashboard, Lead details, Logout only */}

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
        <Route path="leads/:id" element={<LeadDetailsPage />} />
      </Route>

      {/* Dashboard (everyone else) */}

      <Route
        path="/dashboard"
        element={withLayout(<DashboardPage />)}
      />

      {/* Users */}

      <Route
        path="/users"
        element={withLayout(<UsersPage />)}
      />

      <Route
        path="/users/create"
        element={withLayout(<CreateUserPage />)}
      />

      <Route
        path="/users/edit/:id"
        element={withLayout(<EditUserPage />)}
      />

      {/* Leads */}

      <Route
        path="/students"
        element={withLayout(<StudentsPage />)}
      />

      <Route
        path="/students/create"
        element={withLayout(<CreateStudentPage />)}
      />

      <Route
        path="/students/edit/:id"
        element={withLayout(<EditStudentPage />)}
      />

      <Route
        path="/students/:id"
        element={withLayout(<LeadDetailsPage />)}
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