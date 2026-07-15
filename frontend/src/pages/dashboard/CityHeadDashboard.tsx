import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

interface Student {
  _id: string;
  name: string;
  phone: string;
  studyPreference: string;
  city: string;
  leadStatus: "Cold" | "Warm" | "Hot" | "Converted" | "Withdrawn";
  createdAt: string;
  followUpDate?: string;
}

interface Counts {
  total: number;
  cold: number;
  warm: number;
  hot: number;
  converted: number;
  withdrawn: number;
}

const EMPTY_COUNTS: Counts = {
  total: 0,
  cold: 0,
  warm: 0,
  hot: 0,
  converted: 0,
  withdrawn: 0,
};

const STAT_CARDS: {
  key: keyof Counts;
  label: string;
  accent: string;
}[] = [
  { key: "total", label: "Total leads", accent: "bg-purple-500" },
  { key: "cold", label: "Cold", accent: "bg-red-500" },
  { key: "warm", label: "Warm", accent: "bg-yellow-500" },
  { key: "hot", label: "Hot", accent: "bg-green-500" },
  { key: "converted", label: "Converted", accent: "bg-blue-500" },
  { key: "withdrawn", label: "Withdrawn", accent: "bg-gray-400" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

const isToday = (value?: string) => {
  if (!value) return false;
  const d = new Date(value);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const workflow = [
  "Inquiry captured by data entry",
  "Regional head assigns partner",
  "Partner routes to you as city head",
  "You update remarks and follow-up",
];

const CityHeadDashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [latestLeads, setLatestLeads] = useState<Student[]>([]);
  const [todayFollowups, setTodayFollowups] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // The backend already scopes a city_head caller's results to
        // their own city, so no extra city filter is needed here.
        const { data } = await getStudents({ limit: 1000 });
        const students: Student[] = data.students || [];

        const nextCounts = students.reduce(
          (acc, student) => {
            acc.total += 1;
            switch (student.leadStatus) {
              case "Cold":
                acc.cold += 1;
                break;
              case "Warm":
                acc.warm += 1;
                break;
              case "Hot":
                acc.hot += 1;
                break;
              case "Converted":
                acc.converted += 1;
                break;
              case "Withdrawn":
                acc.withdrawn += 1;
                break;
            }
            return acc;
          },
          { ...EMPTY_COUNTS }
        );

        setCounts(nextCounts);
        setLatestLeads(students.slice(0, 5));
        setTodayFollowups(students.filter((s) => isToday(s.followUpDate)));
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-teal-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

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
              A focused view of leads in {user?.city || "your city"}, so nothing slips through
              during follow-up.
            </p>
          </div>
          <div className="flex-none rounded-xl bg-white/15 px-5 py-3 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-100">Your city</p>
            <p className="mt-1 text-sm font-semibold">{user?.city || "Not set"}</p>
          </div>
        </div>
      </div>

      {/* Stat strip — one continuous row, evenly divided, no card gaps */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-100 shadow-sm sm:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="flex flex-col justify-between bg-white p-5">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${card.accent}`} />
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{counts[card.key]}</p>
          </div>
        ))}
      </div>

      {/* Leads + workflow — matched heights, no dangling whitespace */}
      <div className="grid items-stretch gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Latest leads</h2>
              <p className="mt-0.5 text-sm text-slate-500">Quick view of the newest student inquiries in your city.</p>
            </div>
            <Link
              to="/city-head/leads"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
            </Link>
          </div>
          <div className="flex-1 divide-y divide-emerald-50">
            {latestLeads.length === 0 && (
              <p className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
                No leads recorded yet.
              </p>
            )}
            {latestLeads.map((lead) => (
              <div key={lead._id} className="flex items-center justify-between py-3.5">
                <div>
                  <Link
                    to={`/city-head/leads/${lead._id}`}
                    className="font-medium text-slate-800 hover:text-emerald-700"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-sm text-slate-500">{lead.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize text-slate-700">{lead.leadStatus}</p>
                  <p className="text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Workflow focus</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review assigned leads, update remarks, and move them through the pipeline.
          </p>
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

      {/* Today's follow-ups */}
      <div className="flex flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Today's follow-ups</h2>
        <div className="mt-4 flex-1 divide-y divide-emerald-50">
          {todayFollowups.length === 0 && (
            <p className="flex h-full min-h-[160px] items-center justify-center text-sm text-slate-400">
              Nothing scheduled for today.
            </p>
          )}
          {todayFollowups.map((item) => (
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
    </div>
  );
};

export default CityHeadDashboard;