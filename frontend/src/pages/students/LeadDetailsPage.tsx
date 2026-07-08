import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentById } from "../../api/studentApi";

const LeadDetailsPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const { data } = await getStudentById(id);
        setStudent(data.student);
      } catch {
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading lead details...</div>;
  }

  if (!student) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">Lead not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lead details</h1>
          <p className="text-sm text-slate-500">Review all available student information and next actions.</p>
        </div>
        <Link to={`/students/edit/${student._id}`} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Edit lead</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-slate-500">Name</p><p className="mt-1 font-semibold text-slate-900">{student.name}</p></div>
            <div><p className="text-sm text-slate-500">Email</p><p className="mt-1 font-semibold text-slate-900">{student.email}</p></div>
            <div><p className="text-sm text-slate-500">Phone</p><p className="mt-1 font-semibold text-slate-900">{student.phone}</p></div>
            <div><p className="text-sm text-slate-500">Study preference</p><p className="mt-1 font-semibold text-slate-900">{student.studyPreference}</p></div>
            <div><p className="text-sm text-slate-500">Preferred country</p><p className="mt-1 font-semibold text-slate-900">{student.preferredCountry || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Region</p><p className="mt-1 font-semibold text-slate-900">{student.region || "—"}</p></div>
            <div><p className="text-sm text-slate-500">City</p><p className="mt-1 font-semibold text-slate-900">{student.city}</p></div>
            <div><p className="text-sm text-slate-500">Lead status</p><p className="mt-1 font-semibold text-slate-900">{student.leadStatus || "Cold"}</p></div>
            <div><p className="text-sm text-slate-500">Follow-up date</p><p className="mt-1 font-semibold text-slate-900">{student.followUpDate ? new Date(student.followUpDate).toLocaleDateString() : "—"}</p></div>
            <div><p className="text-sm text-slate-500">Created by</p><p className="mt-1 font-semibold text-slate-900">{student.createdBy?.name || "—"}</p></div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Remarks</p>
            <p className="mt-2 text-sm text-slate-700">{student.remarks || "No remarks added yet."}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 space-y-3">
            <Link to="/students" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to leads</Link>
            <Link to="/students/create" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Create another lead</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPage;
