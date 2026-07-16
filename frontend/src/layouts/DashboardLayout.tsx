import { useState } from "react";
import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import NotificationDrawer from "../components/NotificationDrawer";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_35%),linear-gradient(135deg,_#f8fffb_0%,_#f2f8f5_100%)] text-slate-800">
      <div
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity lg:hidden ${isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-emerald-100 bg-emerald-950 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onNavigate={closeSidebar} />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar
          onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          onNotificationClick={() =>
            setIsNotificationOpen((value) => !value)
          }
        />
        <NotificationDrawer
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
