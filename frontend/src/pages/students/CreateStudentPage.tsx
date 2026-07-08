import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStudent } from "../../api/studentApi";

const CreateStudentPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    studyPreference: "",
    preferredCountry: "",
    region: "",
    city: "",
    remarks: "",
    followUpDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createStudent(form);
      navigate("/students");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create lead</h1>
      <p className="mt-2 text-sm text-slate-500">Capture a new lead and plan its next follow-up.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        {error ? <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Study preference</label>
          <select name="studyPreference" value={form.studyPreference} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select preference</option>
            <option value="Study in India">Study in India</option>
            <option value="Study Abroad">Study Abroad</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Preferred country</label>
          <input name="preferredCountry" value={form.preferredCountry} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Region</label>
          <select name="region" value={form.region} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select region</option>
            <option value="North India">North India</option>
            <option value="South India">South India</option>
            <option value="Nepal Region">Nepal Region</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <input name="city" value={form.city} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up date</label>
          <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
          <textarea name="remarks" rows={4} value={form.remarks} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/students")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">{loading ? "Saving..." : "Create lead"}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudentPage;
