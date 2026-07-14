import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById, updateStudent } from "../../api/studentApi";

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    studyPreference: "Study in India",
    preferredCountry: "",
    region: "",
    city: "",
    remarks: "",
    followUpDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cityOptions = CITIES_BY_REGION[form.region] || [];

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const { data } = await getStudentById(id);

        const student = data.student;

        setForm({
          name: student.name || "",
          email: student.email || "",
          phone: student.phone || "",
          studyPreference: student.studyPreference || "Study in India",
          preferredCountry: student.preferredCountry || "",
          region: student.region || "",
          city: student.city || "",
          remarks: student.remarks || "",
          followUpDate: student.followUpDate ? new Date(student.followUpDate).toISOString().split("T")[0] : "",
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Unable to load lead");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!id) return;
    try {
      await updateStudent(id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        studyPreference: form.studyPreference,
        preferredCountry: form.preferredCountry,
        region: form.region,
        city: form.city,
        remarks: form.remarks,
        followUpDate: form.followUpDate || undefined,
      });
      navigate(`/students/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update lead");
    }
  };

  const cityOptions = useMemo(() => (form.region ? CITIES_BY_REGION[form.region] || [] : []), [form.region]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading lead...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit lead</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        {error ? <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Name</label><input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Study preference</label><select name="studyPreference" value={form.studyPreference} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2"><option value="">Select preference</option><option value="Study in India">Study in India</option><option value="Study Abroad">Study Abroad</option></select></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Preferred country</label><input name="preferredCountry" value={form.preferredCountry} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Region</label><select name="region" value={form.region} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2"><option value="">Select region</option><option value="North India">North India</option><option value="South India">South India</option><option value="Nepal Region">Nepal Region</option></select></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">City</label><input name="city" value={form.city} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-700">Follow-up date</label><input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label><textarea name="remarks" rows={4} value={form.remarks} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></div>
        <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => navigate("/students")} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="submit" className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Save changes</button></div>
      </form>
    </div>
  );
};

export default EditStudentPage;