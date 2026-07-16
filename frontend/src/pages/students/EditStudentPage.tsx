import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById, updateStudent } from "../../api/studentApi";

const CITIES_BY_REGION: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  Haryana: ["Panipat", "Karnal", "Hisar", "Rohtak"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Coastal Karnataka": ["Mangaluru", "Manipal", "Udupi", "Puttur", "Karwar"],
  "North Karnataka": ["Hubballi", "Belagavi", "Dharwad", "Kalaburagi", "Vijayapura"],
  "South Karnataka": [
    "Bengaluru North",
    "Bengaluru South",
    "Bengaluru HSR Layout",
    "Mysuru",
    "Hassan",
    "Tumakuru",
    "Shivamogga",
    "Davanagere",
    "Chikkamagaluru",
  ],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kottayam"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  Nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar"],
  Dubai: ["Dubai", "Sharjah", "Abu Dhabi"],
};

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
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (name === "region") {
      // Reset city whenever region changes, since the previous city may
      // not belong to the new region.
      setForm((prev) => ({ ...prev, region: value, city: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setSaving(true);
    setError("");
    try {
      await updateStudent(id, form);
      navigate(`/students/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update lead");
    } finally {
      setSaving(false);
    }
  };

  const cityOptions = useMemo(
    () => (form.region ? CITIES_BY_REGION[form.region] || [] : []),
    [form.region]
  );

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading lead...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Lead</h1>
      <p className="mt-2 text-sm text-slate-500">Update the student's information.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        {error && (
          <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Study Preference</label>
          <select name="studyPreference" value={form.studyPreference} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select Preference</option>
            <option value="Study in India">Study in India</option>
            <option value="Study Abroad">Study Abroad</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Preferred Country</label>
          <input name="preferredCountry" value={form.preferredCountry} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Region</label>
          <select name="region" value={form.region} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select Region</option>
            <optgroup label="North India">
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Rajasthan">Rajasthan</option>
            </optgroup>
            <optgroup label="South India">
              <option value="Coastal Karnataka">Coastal Karnataka</option>
              <option value="North Karnataka">North Karnataka</option>
              <option value="South Karnataka">South Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
            </optgroup>
            <optgroup label="International">
              <option value="Nepal">Nepal</option>
              <option value="Dubai">Dubai</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            disabled={!form.region}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">{form.region ? "Select City" : "Select Region First"}</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up Date</label>
          <input type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
          <textarea rows={4} name="remarks" value={form.remarks} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/students")} className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudentPage;