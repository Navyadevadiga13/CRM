import { BadgeCheck, LayoutDashboard, UserPlus2, Users, UserRoundPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user } = useAuth();

  const isRegionalHead = user?.role === "regional_head";

  const links = [
    {
      to: isRegionalHead ? "/regional-head/dashboard" : "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: isRegionalHead ? "/regional-head/leads" : "/students",
      label: "Lead pipeline",
      icon: UserRoundPlus,
    },
  ];

  if (user?.role && !["city_head", "data_entry"].includes(user.role)) {
    links.push({ to: "/users", label: "Team access", icon: Users });
    links.push({ to: "/users/create", label: "Add role", icon: UserPlus2 });
  }

  const roleLabel = user?.role?.replace(/_/g, " ") || "User";

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-emerald-950 text-emerald-50">
      <div className="border-b border-emerald-900/70 px-6 py-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/70 bg-emerald-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
          <BadgeCheck size={14} />
          EduCRM
        </div>
        <h1 className="mt-3 text-xl font-semibold">Overseas Education CRM</h1>
        <p className="mt-2 text-sm text-emerald-200/80">From inquiry to admission, every lead stays visible.</p>
        <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100">
          {roleLabel}
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive ? "bg-emerald-600/20 text-emerald-200" : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;