import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BadgeCheck, LayoutDashboard, LogOut, Menu, UserRoundPlus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Deliberately NOT the generic DashboardLayout — a regional head only ever
// needs these three things, so this is its own small shell rather than the
// full sidebar (Users, Team access, Add role, etc.) that other roles see.
const NAV_ITEMS = [
  { to: "/regional-head", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/regional-head/leads", label: "Lead details", end: false, icon: UserRoundPlus },
];

const RegionalHeadLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-white/15 text-white"
        : "text-teal-50/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Mobile top bar with hamburger */}
      <div className="flex items-center justify-between border-b border-teal-100 bg-white px-4 py-3 shadow-sm md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          className="flex items-center justify-center rounded-xl border border-teal-100 p-2 text-slate-600 transition hover:bg-teal-50"
        >
          <Menu size={22} />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">EduCRM</p>
        <div className="w-9" /> {/* spacer to balance the hamburger button */}
      </div>

      {/* Overlay behind sidebar on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between bg-gradient-to-b from-teal-900 to-emerald-900 px-6 py-8 text-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/70 bg-teal-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-teal-200">
                <BadgeCheck size={14} />
                EduCRM
              </div>
              <p className="mt-2 text-lg font-semibold">Overseas Education CRM</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation menu"
              className="rounded-lg p-1 text-teal-100 hover:bg-white/10 md:hidden"
            >
              <X size={22} />
            </button>
          </div>

          <p className="mb-4 text-sm text-teal-100/80">
            From inquiry to admission, every lead stays visible.
          </p>

          <span className="mb-8 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-50">
            Regional head
          </span>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClasses}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 md:hidden"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="hidden items-center justify-between border-b border-teal-100 bg-white px-6 py-4 shadow-sm md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Regional head</p>
            <p className="text-sm font-medium text-slate-700">{user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
              regional head
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-teal-200 px-4 py-1.5 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RegionalHeadLayout;