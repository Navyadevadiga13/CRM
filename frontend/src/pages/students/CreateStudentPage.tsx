import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStudent } from "../../api/studentApi";

const CITIES_BY_REGION: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  Haryana: ["Panipat", "Karnal", "Hisar", "Rohtak"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],

  "Coastal Karnataka": ["Mangaluru", "Udupi", "Karwar"],
  "North Karnataka": ["Hubballi", "Belagavi", "Kalaburagi", "Vijayapura"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kottayam"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],

  Nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar"],
  Dubai: ["Dubai", "Sharjah", "Abu Dhabi"],
};

export const COUNTRIES = [
  "Australia",
  "Austria",
  "Canada",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dubai (UAE)",
  "Finland",
  "France",
  "Germany",
  "Hungary",
  "Ireland",
  "Italy",
  "Japan",
  "Latvia",
  "Lithuania",
  "Malaysia",
  "Malta",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Poland",
  "Portugal",
  "Singapore",
  "Slovakia",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
  "Other",
];

const CreateStudentPage = () => {
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;

    if (name === "region") {
      // Reset city whenever the region changes, since the previously
      // selected city may not belong to the new region.
      setForm((prev) => ({ ...prev, region: value, city: "" }));
      return;
    }

    if (name === "preferredCountry" && value !== "Other") {
      // Clear any typed custom country if the user switches away from "Other"
      setOtherCountry("");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      preferredCountry:
        form.preferredCountry === "Other" ? otherCountry : form.preferredCountry,
    };

    try {
      await createStudent(payload);
      navigate("/students");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to create lead");
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = useMemo(() => (form.region ? CITIES_BY_REGION[form.region] || [] : []), [form.region]);

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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Study preference</label>
          <select name="studyPreference" value={form.studyPreference} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white">
            {STUDY_PREFERENCES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Preferred country</label>
          <input name="preferredCountry" value={form.preferredCountry} onChange={handleChange} placeholder="Optional" className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Region</label>
          <select name="region" value={form.region} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select region</option>
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
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Kerala">Kerala</option>
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
            required
            disabled={!form.region}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">{form.region ? "Select city" : "Select region first"}</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up date</label>
          <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Remarks</label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={3} placeholder="Optional notes about this lead" className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
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
