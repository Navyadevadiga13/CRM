import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteStudent, getStudents } from "../../api/studentApi";

const statusClasses: Record<string, string> = {
  Cold: "bg-amber-100 text-amber-700",
  Warm: "bg-violet-100 text-violet-700",
  Hot: "bg-rose-100 text-rose-700",
  Converted: "bg-teal-100 text-teal-700",
  Withdrawn: "bg-slate-200 text-slate-700",
};

const StudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data } = await getStudents({ status: status || undefined, region: region || undefined, page: 1, limit: 20 });
      setStudents(data.students || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const handleFilter = () => {
    void loadStudents();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await deleteStudent(id);
      setMessage("Lead deleted successfully.");
      void loadStudents();
    } catch {
      setMessage("Unable to delete lead.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lead pipeline</h1>
          <p className="text-sm text-slate-500">Review inquiries, follow-up dates, and progression through the consultancy funnel.</p>
        </div>
        <Link to="/students/create" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">Create lead</Link>
      </div>
       {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null}

      <div className="rounded-[28px] border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
  <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700"> 
  <option value="">All statuses</option>
  <option value="Cold">Cold</option>
  <option value="Warm">Warm</option>
  <option value="Hot">Hot</option>
  <option value="Converted">Converted</option>
  <option value="Withdrawn">Withdrawn</option>
</select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700">
            <option value="">All regions</option>
            <option value="North India">North India</option>
            <option value="South India">South India</option>
            <option value="Nepal Region">Nepal Region</option>
          </select>
          <button onClick={handleFilter} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apply</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[28px] border border-emerald-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-emerald-100 text-sm">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Student</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Study preference</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">City</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Follow-up</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Loading leads...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No leads found.</td></tr>
            ) : students.map((student) => (
              <tr key={student._id} className="hover:bg-emerald-50/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{student.name}</div>
                  <div className="text-xs text-slate-500">{student.phone}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{student.studyPreference || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{student.city || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{student.followUpDate ? new Date(student.followUpDate).toLocaleDateString() : "No date"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[student.leadStatus || "Cold"] || "bg-slate-100 text-slate-700"}`}>
                    {student.leadStatus || "Cold"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/students/${student._id}`} className="text-sm font-medium text-emerald-600">View</Link>
                    <Link to={`/students/edit/${student._id}`} className="text-sm font-medium text-amber-600">Edit</Link>
                    <button onClick={() => handleDelete(student._id)} className="text-sm font-medium text-rose-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;
