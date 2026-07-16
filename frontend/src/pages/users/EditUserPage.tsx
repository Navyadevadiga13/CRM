import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

// Kept in sync with CreateUserPage.tsx and the backend's utils/regions.js —
// same zone/region/city taxonomy everywhere, so create and edit forms
// behave identically and never offer a selection the API will reject.
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

// Zone -> the granular regions that fall under it. Co-admins are scoped to
// a whole zone; regional heads (and partners/city heads) pick a granular
// region within a zone.
const ZONES: Record<string, string[]> = {
  "North India": ["Delhi NCR", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"],
  "South India": ["Coastal Karnataka", "North Karnataka", "Tamil Nadu", "Kerala", "Telangana"],
  International: ["Nepal", "Dubai"],
};

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", region: "", division: "", city: "", cities: [] as string[], isActive: true as boolean, role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const { data } = await getUserById(id);
        const user = data.user;
        setForm({
          name: user.name || "",
          phone: user.phone || "",
          region: user.region || "",
          division: user.division || "",
          city: user.city || "",
          cities: user.cities || [],
          isActive: Boolean(user.isActive),
          role: user.role || "",
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Unable to load user");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "region" || name === "division" || name === "role") {
        next.city = "";
        next.cities = [];
      }
      return next;
    });
  };

  const handleCityToggle = (city: string) => {
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.includes(city) ? prev.cities.filter((item) => item !== city) : [...prev.cities, city],
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!id) return;
    try {
      // Co-Admin can never change isActive (on anyone), and nobody can
      // change isActive on a Super Admin — mirrors the backend exactly.
      // Omitting the field (rather than sending the unchanged value) keeps
      // the request a no-op for status even if state ever gets out of sync.
      const payload: Record<string, unknown> = { ...form, cities: form.cities };
      if (!canEditStatus) {
        delete payload.isActive;
      }
      await updateUser(id, payload);
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update user");
    }
  };

  const isCoAdmin = form.role === "co_admin";
  const showRegion = useMemo(() => ["regional_head", "partner", "co_admin", "city_head"].includes(form.role), [form.role]);
  const showCity = form.role === "city_head";
  const showCities = form.role === "partner";
  const cityOptions = useMemo(() => (form.region ? CITIES_BY_REGION[form.region] || [] : []), [form.region]);

  // Mirrors the backend's updateUser rule exactly: a Co-Admin can never
  // activate/deactivate anyone, and nobody (not even Super Admin) can
  // activate/deactivate the Super Admin account.
  const canEditStatus = currentUser?.role !== "co_admin" && form.role !== "super_admin";

  if (loading) {
    return <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 text-sm text-slate-500 shadow-sm">Loading user...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">User management</p>
          <h1 className="text-2xl font-semibold text-slate-900">Edit user</h1>
        </div>
        <div className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-700 shadow-sm">
          Update profile details
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {error ? (
          <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
        </div>

        {showRegion ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{isCoAdmin ? "Zone" : "Region"}</label>
            <select name={isCoAdmin ? "division" : "region"} value={isCoAdmin ? form.division : form.region} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
              {isCoAdmin ? (
                <>
                  <option value="">Select zone</option>
                  {Object.keys(ZONES).map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </>
              ) : (
                <>
                  <option value="">Select region</option>
                  <optgroup label="North India">
                    {ZONES["North India"].map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </optgroup>
                  <optgroup label="South India">
                    {ZONES["South India"].map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </optgroup>
                  <optgroup label="International">
                    {ZONES.International.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
            {isCoAdmin ? (
              <p className="text-xs text-slate-500">Co-admins are scoped to a whole zone rather than a single region.</p>
            ) : null}
          </div>
        ) : null}

        {showCity ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">City</label>
            <select name="city" value={form.city} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" disabled={!form.region}>
              <option value="">{form.region ? "Select city" : "Select region first"}</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        ) : null}

        {showCities ? (
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Cities</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {cityOptions.map((city) => (
                <label key={city} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                  <input type="checkbox" checked={form.cities.includes(city)} onChange={() => handleCityToggle(city)} className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                  {city}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {canEditStatus ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select name="isActive" value={String(form.isActive)} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              <span>{form.isActive ? "Active" : "Inactive"}</span>
              <span className="text-xs">
                {form.role === "super_admin"
                  ? "Super Admin status cannot be changed"
                  : "Co-Admins cannot change user status"}
              </span>
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate("/users")} className="rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50">Cancel</button>
          <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">Save changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
