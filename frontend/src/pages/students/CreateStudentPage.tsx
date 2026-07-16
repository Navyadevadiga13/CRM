import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStudent } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

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

const STUDY_PREFERENCES = ["Study in India", "Study Abroad"];

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
  const { user } = useAuth();

  // The backend's createStudent forces region = req.user.region and
  // rejects the request outright if city !== req.user.city for a
  // city_head caller. So a city_head never actually gets to choose these
  // — we pre-fill and lock them instead of showing pickers that would
  // just 403 on submit. A regional_head's region is also locked (they
  // can pick any city within it, but not another region).
  const isCityHead = user?.role === "city_head";
  const isRegionalHead = user?.role === "regional_head";

  // Where Cancel and the post-submit redirect should send the user.
  const basePath = isRegionalHead
    ? "/regional-head/leads"
    : isCityHead
      ? "/city-head/leads"
      : "/students";

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
  const [otherCountry, setOtherCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill region (and city, for city_head) once the logged-in user is
  // available (useAuth may resolve after initial mount).
  useEffect(() => {
    if (isCityHead && user) {
      setForm((prev) => ({
        ...prev,
        region: user.region || prev.region,
        city: user.city || prev.city,
      }));
    }

    if (isRegionalHead && user) {
      setForm((prev) => ({
        ...prev,
        region: user.region || prev.region,
      }));
    }
  }, [isCityHead, isRegionalHead, user]);

  const handleChange = (event: any) => {
    const { name, value } = event.target;

    if (name === "region") {
      // Reset city whenever the region changes, since the previously
      // selected city may not belong to the new region. Not reachable
      // for city_head/regional_head since the region field is locked
      // for them.
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

    // Phone number validation
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError(
        "Phone number must be exactly 10 digits and start with 6, 7, 8, or 9."
      );
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      preferredCountry:
        form.preferredCountry === "Other" ? otherCountry : form.preferredCountry,
    };

    try {
      await createStudent(payload);
      navigate(basePath);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to create lead");
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = useMemo(
    () => (form.region ? CITIES_BY_REGION[form.region] || [] : []),
    [form.region]
  );

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create lead</h1>
      <p className="mt-2 text-sm text-slate-500">Capture a new lead and plan its next follow-up.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
        {error ? <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        {isCityHead ? (
          <div className="md:col-span-2 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
            New leads you create are automatically added to your assigned city
            {form.city ? ` (${form.city}` : ""}
            {form.region ? `, ${form.region})` : form.city ? ")" : "."}
            .
          </div>
        ) : null}

        {isRegionalHead ? (
          <div className="md:col-span-2 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-800">
            New leads you create are automatically added to your assigned region
            {form.region ? ` (${form.region})` : ""}.
          </div>
        ) : null}

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
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm((prev) => ({ ...prev, phone: value }));
            }}
            maxLength={10}
            placeholder="9876543210"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Study preference</label>
          <select
            name="studyPreference"
            value={form.studyPreference}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            {STUDY_PREFERENCES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Preferred country</label>
          <select name="preferredCountry" value={form.preferredCountry} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="">Select country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {form.preferredCountry === "Other" ? (
            <input
              name="otherCountry"
              value={otherCountry}
              onChange={(e) => setOtherCountry(e.target.value)}
              placeholder="Enter country"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Region</label>
          {isCityHead || isRegionalHead ? (
            <input
              value={form.region || "Not set on your account"}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
            />
          ) : (
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
                <option value="South Karnataka">South Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Kerala">Kerala</option>
                <option value="Telangana">Telangana</option>
              </optgroup>
              <optgroup label="International">
                <option value="Nepal">Nepal</option>
                <option value="Dubai">Dubai</option>
              </optgroup>
            </select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          {isCityHead ? (
            <input
              value={form.city || "Not set on your account"}
              disabled
              required
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
            />
          ) : (
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
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Follow-up date</label>
          <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
          <textarea name="remarks" rows={4} value={form.remarks} onChange={handleChange} placeholder="Optional notes about this lead" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(basePath)} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={loading || (isCityHead && !form.city)} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
            {loading ? "Saving..." : "Create lead"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStudentPage;