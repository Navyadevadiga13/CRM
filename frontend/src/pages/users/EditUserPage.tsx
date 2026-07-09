import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../api/userApi";

const cityOptionsByRegion = {
  "North India": ["Delhi", "Noida", "Jaipur", "Lucknow", "Chandigarh"],
  "South India": ["Bangalore", "Hyderabad", "Chennai", "Kochi", "Mangalore"],
  "Nepal Region": ["Kathmandu", "Pokhara", "Lalitpur"],
};

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", region: "", city: "", cities: [] as string[], isActive: true as boolean, role: "" });
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
          city: user.city || "",
          cities: user.cities || [],
          isActive: Boolean(user.isActive),
          role: user.role || "",
        });
      } catch {
        setError("Unable to load user");
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
      if (name === "region" || name === "role") {
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
      await updateUser(id, { ...form, cities: form.cities });
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update user");
    }
  };

  const showRegion = useMemo(() => ["regional_head", "partner", "co_admin", "city_head"].includes(form.role), [form.role]);
  const showCity = form.role === "city_head";
  const showCities = form.role === "partner";
  const cityOptions = useMemo(() => (form.region ? cityOptionsByRegion[form.region as keyof typeof cityOptionsByRegion] || [] : []), [form.region]);

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
            <label className="block text-sm font-medium text-slate-700">Region</label>
            <select name="region" value={form.region} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
              <option value="">Select region</option>
              <option value="North India">North India</option>
              <option value="South India">South India</option>
              <option value="Nepal Region">Nepal Region</option>
            </select>
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select name="isActive" value={String(form.isActive)} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))} className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-3 text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate("/users")} className="rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50">Cancel</button>
          <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">Save changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;