import { Bell, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotificationContext } from "../context/NotificationContext";

  const Navbar = ({
    onMenuToggle,
    onNotificationClick,
  }: {
    onMenuToggle: () => void;
    onNotificationClick: () => void;
  }) => {

  const { user, logout } = useAuth();
  const roleLabel = user?.role?.replace(/_/g, " ") || "team member";
  const { unreadCount } = useNotificationContext();  return (
    <header className="sticky top-0 z-20 border-b border-emerald-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-sm font-medium text-emerald-600">Welcome back</p>
            <h2 className="text-lg font-semibold text-slate-900">{user?.name || "CRM User"}</h2>
            <p className="text-sm text-slate-500">Managing student leads through the consultancy workflow.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 sm:block">
            {roleLabel}
          </div>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-slate-600 transition hover:bg-emerald-50"
  >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
