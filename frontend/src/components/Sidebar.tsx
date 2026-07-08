import { BadgeCheck, LayoutDashboard, UserPlus2, Users, UserRoundPlus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Lead pipeline", icon: UserRoundPlus },
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

      <div className="border-t border-emerald-900/70 p-4">
        <div className="rounded-2xl border border-emerald-800/70 bg-emerald-900/60 p-4 text-sm text-emerald-100/80">
          <p className="font-semibold text-emerald-100">Role-based workflow</p>
          <p className="mt-1 text-xs leading-5">Regional heads assign partners, partners route city heads, and city heads move leads through follow-up and status updates.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
