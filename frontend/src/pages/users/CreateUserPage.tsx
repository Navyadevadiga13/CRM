import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

const roleGuide = {
  super_admin: "Super admin can create co-admins, regional heads, partners, city heads, and data-entry users.",
  co_admin: "Co admin can create regional heads, partners, city heads, and data-entry users.",
  regional_head: "Regional head can create partners for their region.",
  partner: "Partner can create city heads for the cities they manage.",
  city_head: "City head takes ownership of assigned leads, updates follow-ups, and changes lead status.",
  data_entry: "Data entry captures new student inquiries and keeps the lead record accurate.",
};

const cityOptionsByRegion = {
  "North India": ["Delhi", "Noida", "Jaipur", "Lucknow", "Chandigarh"],
  "South India": ["Bangalore", "Hyderabad", "Chennai", "Kochi", "Mangalore"],
  "Nepal Region": ["Kathmandu", "Pokhara", "Lalitpur"],
};

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "partner",
    region: "",
    city: "",
    cities: [] as string[],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Changing the role or the region invalidates any previously chosen
      // city/cities, since city options depend on region and city fields
      // only apply to certain roles.
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
    setLoading(true);
    setError("");

    try {
      await createUser({
        ...form,
        cities: form.cities,
      });
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to create user");
    } finally {
      setLoading(false);
    }
  };

  const showRegion = useMemo(() => ["regional_head", "partner", "co_admin", "city_head"].includes(form.role), [form.role]);
  const showCity = form.role === "city_head";
  const showCities = form.role === "partner";
  const cityOptions = useMemo(() => (form.region ? cityOptionsByRegion[form.region as keyof typeof cityOptionsByRegion] || [] : []), [form.region]);

  const allowedRoles = useMemo(() => {
    switch (user?.role) {
      case "super_admin":
        return ["super_admin", "co_admin", "regional_head", "partner", "city_head", "data_entry"];
      case "co_admin":
        return ["regional_head", "partner", "city_head", "data_entry"];
      case "regional_head":
        return ["partner"];
      case "partner":
        return ["city_head"];
      default:
        return [];
    }
  }, [user?.role]);

  return (
    <div className="mx-auto max-w-5xl rounded-[32px] border border-emerald-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Create role / team member</h1>
        <p className="mt-2 text-sm text-slate-500">Create the right account in the consultancy hierarchy and give every team member the right access.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {error ? <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 pr-12 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white">
            {allowedRoles.map((role) => (
              <option key={role} value={role}>{role.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {showRegion ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Region</label>
            <select name="region" value={form.region} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white">
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
            <select name="city" value={form.city} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white" disabled={!form.region}>
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
                <label key={city} className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.cities.includes(city)} onChange={() => handleCityToggle(city)} className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                  {city}
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate("/users")} className="rounded-full border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70">{loading ? "Creating..." : "Create role"}</button>
        </div>
      </form>

      <div className="mt-6 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Real-world role flow</p>
        <p className="mt-2">{roleGuide[form.role as keyof typeof roleGuide]}</p>
      </div>
    </div>
  );
};

export default CreateUserPage;