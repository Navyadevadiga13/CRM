import type { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import LoginPage from "./pages/auth/LoginPage";

import DashboardPage from "./pages/dashboard/DashboardPage";

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

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Login */}

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Dashboard */}

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

      {/* Reports */}

  

      {/* Redirect */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? "/dashboard"
                : "/"
            }
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;