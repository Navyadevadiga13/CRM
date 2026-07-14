import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents } from "../../api/studentApi";

interface Student {
  _id: string;
  name: string;
  phone: string;
  studyPreference: string;
  city: string;
  leadStatus: "Cold" | "Warm" | "Hot" | "Converted" | "Withdrawn";
  createdAt: string;
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

const STATUS_BADGE_CLASSES: Record<Student["leadStatus"], string> = {
  Cold: "bg-amber-50 text-amber-700",
  Warm: "bg-orange-50 text-orange-700",
  Hot: "bg-rose-50 text-rose-700",
  Converted: "bg-teal-50 text-teal-700",
  Withdrawn: "bg-slate-100 text-slate-500",
};

const STAT_CARDS: {
  key: keyof Counts;
  label: string;
  dotClass: string;
}[] = [
  { key: "total", label: "Total leads", dotClass: "bg-violet-500" },
  { key: "cold", label: "Cold", dotClass: "bg-rose-500" },
  { key: "warm", label: "Warm", dotClass: "bg-amber-500" },
  { key: "hot", label: "Hot", dotClass: "bg-emerald-500" },
  { key: "converted", label: "Converted", dotClass: "bg-sky-500" },
  { key: "withdrawn", label: "Withdrawn", dotClass: "bg-slate-400" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

const RegionalHeadDashboard = () => {
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [latestLeads, setLatestLeads] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
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
      <div className="rounded-2xl border border-teal-100 bg-white p-6 text-sm text-slate-500">
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
    <div>
      {/* Hero banner */}
      <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">
            Overseas education consultancy
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold sm:text-3xl">
            Track every student journey from inquiry to admission.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-emerald-50/90">
            This CRM keeps leads visible across the hierarchy, supports
            follow-up planning, and makes each stage of the student journey
            easy to manage.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/15 px-6 py-4 text-center backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
            Your role
          </p>
          <p className="mt-1 text-lg font-semibold">Regional Head</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm"
          >
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className={`h-2 w-2 rounded-full ${card.dotClass}`} />
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {counts[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Latest leads */}
      <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Latest leads
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Quick view of the newest student inquiries.
            </p>
          </div>

          <Link
            to="/regional-head/leads"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 divide-y divide-teal-50">
          {latestLeads.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">No leads yet.</p>
          ) : (
            latestLeads.map((lead) => (
              <div
                key={lead._id}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <Link
                    to={`/regional-head/leads/${lead._id}`}
                    className="font-semibold text-slate-800 hover:text-teal-700"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-sm text-slate-400">{lead.phone}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[lead.leadStatus]}`}
                  >
                    {lead.leadStatus}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(lead.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionalHeadDashboard;