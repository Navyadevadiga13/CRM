import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getDashboard } from "../../api/dashboardApi";

interface DashboardData {
  totalStudents: number;
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
  convertedLeads: number;
  activeUsers: number;
  inactiveUsers: number;
  recentStudents: any[];
  todayFollowups: any[];
}

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();

      setDashboard(data.dashboard);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Heading */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500">
            Welcome to WizX CRM
          </p>
        </div>

        {/* Stats */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-2xl border bg-white p-6 shadow">
            <p className="text-slate-500">
              Total Leads
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              {dashboard?.totalStudents}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <p className="text-slate-500">
              Cold Leads
            </p>

            <h2 className="mt-4 text-4xl font-bold text-blue-600">
              {dashboard?.coldLeads}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <p className="text-slate-500">
              Warm Leads
            </p>

            <h2 className="mt-4 text-4xl font-bold text-yellow-500">
              {dashboard?.warmLeads}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <p className="text-slate-500">
              Hot Leads
            </p>

            <h2 className="mt-4 text-4xl font-bold text-red-500">
              {dashboard?.hotLeads}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow">
            <p className="text-slate-500">
              Converted
            </p>

            <h2 className="mt-4 text-4xl font-bold text-green-600">
              {dashboard?.convertedLeads}
            </h2>
          </div>

        </div>

        {/* Recent Leads */}

        <div className="rounded-2xl border bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold">
            Recent Leads
          </h2>

          {dashboard?.recentStudents?.length === 0 ? (
            <p className="text-slate-500">
              No recent leads.
            </p>
          ) : (
            <div className="space-y-3">

              {dashboard?.recentStudents?.map(
                (student: any) => (
                  <div
                    key={student._id}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="font-semibold">
                      {student.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {student.phone}
                    </p>

                    <p className="text-sm text-blue-600">
                      {student.leadStatus}
                    </p>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* Today's Follow-ups */}

        <div className="rounded-2xl border bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold">
            Today's Follow-ups
          </h2>

          {dashboard?.todayFollowups?.length === 0 ? (
            <p className="text-slate-500">
              No follow-ups today.
            </p>
          ) : (
            <div className="space-y-3">

              {dashboard?.todayFollowups?.map(
                (student: any) => (
                  <div
                    key={student._id}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="font-semibold">
                      {student.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {student.phone}
                    </p>

                    <p className="text-sm text-red-600">
                      {new Date(
                        student.followUpDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}