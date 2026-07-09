import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api/dashboardApi";
import { useAuth } from "../../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDashboard();
        setDashboard(data.dashboard);
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="rounded-[28px] border border-emerald-100 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading dashboard...</div>;
  }

  const roleLabel = user?.role?.replace(/_/g, " ") || "team member";
  const roleMessage =
    user?.role === "data_entry"
      ? "Capture new leads and keep the inquiry record fresh."
      : user?.role === "city_head"
        ? "Review assigned leads, update remarks, and move them through the pipeline."
        : user?.role === "partner"
          ? "Coordinate city heads and keep assigned leads on the right path."
          : user?.role === "regional_head"
            ? "Monitor the regional funnel and assign partners where needed."
            : "Keep the entire consultancy operation aligned and visible.";

  // Now includes Converted and Withdrawn alongside Total / Cold / Warm / Hot
  const stats = [
    { label: "Total leads", value: dashboard?.totalLeads ?? 0, accent: "from-emerald-500 to-green-500" },
    { label: "Cold", value: dashboard?.coldLeads ?? 0, accent: "from-amber-500 to-orange-500" },
    { label: "Warm", value: dashboard?.warmLeads ?? 0, accent: "from-violet-500 to-fuchsia-500" },
    { label: "Hot", value: dashboard?.hotLeads ?? 0, accent: "from-rose-500 to-red-500" },
    { label: "Converted", value: dashboard?.convertedLeads ?? 0, accent: "from-teal-500 to-cyan-500" },
    { label: "Withdrawn", value: dashboard?.withdrawnLeads ?? 0, accent: "from-slate-500 to-slate-400" },
  ];

  const workflow = [
    "Inquiry captured by data entry",
    "Regional head assigns partner",
    "Partner routes city head",
    "City head updates remarks and follow-up",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 p-8 text-white shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-100">Overseas education consultancy</p>
        <h1 className="mt-3 text-3xl font-semibold">Track every student journey from inquiry to admission.</h1>
        <p className="mt-3 max-w-2xl text-sm text-emerald-50/90">This CRM keeps leads visible across the hierarchy, supports follow-up planning, and makes each stage of the student journey easy to manage.</p>
        <div className="mt-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-medium">Your role: {roleLabel}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
            <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${item.accent}`} />
            <p className="mt-4 text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest leads</h2>
              <p className="mt-1 text-sm text-slate-500">Quick view of the newest student inquiries.</p>
            </div>
            <Link to="/students" className="text-sm font-medium text-emerald-600">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {(dashboard?.recentLeads || []).map((lead: any) => (
              <div key={lead._id} className="flex items-center justify-between rounded-2xl border border-emerald-50 bg-emerald-50/50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-800">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{lead.leadStatus}</p>
                  <p className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workflow focus</h2>
          <p className="mt-2 text-sm text-slate-500">{roleMessage}</p>
          <div className="mt-4 space-y-3">
            {workflow.map((step) => (
              <div key={step} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-slate-700">
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today’s follow-ups</h2>
          <div className="mt-4 space-y-3">
            {(dashboard?.todayFollowups || []).map((item: any) => (
              <div key={item._id} className="flex items-center justify-between rounded-2xl border border-emerald-100 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{item.leadStatus}</p>
                  <p className="text-xs text-slate-400">{item.followUpDate ? new Date(item.followUpDate).toLocaleString() : "No date"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Team snapshot</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm text-slate-500">Partners</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard?.partners ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm text-slate-500">City heads</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard?.cityHeads ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm text-slate-500">Data entry</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard?.dataEntries ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm text-slate-500">Active users</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboard?.activeUsers ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;