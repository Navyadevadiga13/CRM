import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-white shadow-xl">

      {/* Logo */}

      <div className="border-b border-slate-800 p-6">

        <h1 className="text-3xl font-bold tracking-wide text-blue-500">
          WizX CRM
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Overseas Education
        </p>

      </div>

      {/* Menu */}

      <nav className="flex-1 space-y-2 p-4">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <GraduationCap size={20} />
          Leads
        </NavLink>

        {(user?.role === "super_admin" ||
          user?.role === "co_admin") && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Users size={20} />
            Users
          </NavLink>
        )}

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <BarChart3 size={20} />
          Reports
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>

            <p className="font-medium">
              {user?.name}
            </p>

            <p className="text-xs capitalize text-slate-400">
              {user?.role?.replaceAll("_", " ")}
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}