import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getStudent } from "../../api/studentApi";

export default function LeadDetailsPage() {
  const { id } = useParams();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const data = await getStudent(id!);
      setStudent(data.student);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center">
          Lead not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="space-y-6">

        <div className="rounded-xl bg-white p-8 shadow">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                {student.name}
              </h1>

              <p className="text-slate-500">
                Lead Details
              </p>

            </div>

            <Link
              to={`/students/edit/${student._id}`}
              className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
            >
              Edit Lead
            </Link>

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-5 text-xl font-semibold">
              Personal Information
            </h2>

            <div className="space-y-3">

              <p><strong>Name:</strong> {student.name}</p>

              <p><strong>Email:</strong> {student.email}</p>

              <p><strong>Phone:</strong> {student.phone}</p>

              <p><strong>Region:</strong> {student.region}</p>

              <p><strong>City:</strong> {student.city}</p>

            </div>

          </div>

          <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-5 text-xl font-semibold">
              Study Information
            </h2>

            <div className="space-y-3">

              <p>
                <strong>Interested Country:</strong>{" "}
                {student.interestedCountry}
              </p>

              <p>
                <strong>Intake:</strong>{" "}
                {student.intakeMonth} {student.intakeYear}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="rounded bg-blue-100 px-3 py-1 text-blue-700">
                  {student.leadStatus}
                </span>
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-5 text-xl font-semibold">
              Assignment
            </h2>

            <div className="space-y-3">

              <p>
                <strong>Partner:</strong>{" "}
                {student.partner?.name || "Not Assigned"}
              </p>

              <p>
                <strong>City Head:</strong>{" "}
                {student.cityHead?.name || "Not Assigned"}
              </p>

              <p>
                <strong>Created By:</strong>{" "}
                {student.createdBy?.name || "-"}
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-white p-6 shadow">

            <h2 className="mb-5 text-xl font-semibold">
              Remarks
            </h2>

            <p className="text-slate-700 whitespace-pre-wrap">
              {student.remarks || "No remarks available."}
            </p>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}