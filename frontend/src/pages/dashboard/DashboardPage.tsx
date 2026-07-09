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
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
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

  const stats = [
    { label: "Total leads", value: dashboard?.totalLeads ?? 0, accent: "bg-emerald-500" },
    { label: "Cold", value: dashboard?.coldLeads ?? 0, accent: "bg-amber-500" },
    { label: "Warm", value: dashboard?.warmLeads ?? 0, accent: "bg-fuchsia-500" },
    { label: "Hot", value: dashboard?.hotLeads ?? 0, accent: "bg-rose-500" },
    { label: "Converted", value: dashboard?.convertedLeads ?? 0, accent: "bg-teal-500" },
    { label: "Withdrawn", value: dashboard?.withdrawnLeads ?? 0, accent: "bg-slate-400" },
  ];

  const workflow = [
    "Inquiry captured by data entry",
    "Regional head assigns partner",
    "Partner routes city head",
    "City head updates remarks and follow-up",
  ];

  const recentLeads = dashboard?.recentLeads || [];
  const todayFollowups = dashboard?.todayFollowups || [];

  const teamSnapshot = [
    { label: "Partners", value: dashboard?.partners ?? 0 },
    { label: "City heads", value: dashboard?.cityHeads ?? 0 },
    { label: "Data entry", value: dashboard?.dataEntries ?? 0 },
    { label: "Active users", value: dashboard?.activeUsers ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-600 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
              Overseas education consultancy
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
              Track every student journey from inquiry to admission.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50/90">
              This CRM keeps leads visible across the hierarchy, supports follow-up planning, and makes
              each stage of the student journey easy to manage.
            </p>
          </div>
          <div className="flex-none rounded-xl bg-white/15 px-5 py-3 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100">Your role</p>
            <p className="mt-1 text-sm font-semibold capitalize">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Stat strip — one continuous row, evenly divided, no card gaps */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-100 shadow-sm sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((item) => (
          <div key={item.label} className="flex flex-col justify-between bg-white p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.accent}`} />
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Leads + workflow — matched heights, no dangling whitespace */}
      <div className="grid items-stretch gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest leads</h2>
              <p className="mt-0.5 text-sm text-slate-500">Quick view of the newest student inquiries.</p>
            </div>
            <Link to="/students" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View all
            </Link>
          </div>
          <div className="flex-1 divide-y divide-emerald-50">
            {recentLeads.length === 0 && (
              <p className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
                No leads recorded yet.
              </p>
            )}
            {recentLeads.map((lead: any) => (
              <div key={lead._id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-slate-800">{lead.name}</p>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize text-slate-700">{lead.leadStatus}</p>
                  <p className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workflow focus</h2>
          <p className="mt-1 text-sm text-slate-500">{roleMessage}</p>
          <div className="mt-4 flex flex-1 flex-col gap-2.5">
            {workflow.map((step, i) => (
              <div
                key={step}
                className="flex flex-1 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3"
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-ups + team snapshot — matched heights */}
      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today's follow-ups</h2>
          <div className="mt-4 flex-1 divide-y divide-emerald-50">
            {todayFollowups.length === 0 && (
              <p className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
                Nothing scheduled for today.
              </p>
            )}
            {todayFollowups.map((item: any) => (
              <div key={item._id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize text-slate-700">{item.leadStatus}</p>
                  <p className="text-xs text-slate-400">
                    {item.followUpDate ? new Date(item.followUpDate).toLocaleString() : "No date"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Team snapshot</h2>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
            {teamSnapshot.map((item) => (
              <div
                key={item.label}
                className="flex flex-col justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;