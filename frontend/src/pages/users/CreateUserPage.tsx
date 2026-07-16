import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

const roleGuide = {
  super_admin: "Super admin has full access and can create any role — other super admins, co-admins, regional heads, partners, city heads, and data-entry users.",
  co_admin: "Co admin owns a zone (South India, North India, or International) and can create regional heads, partners, city heads, and data-entry users within it.",
  regional_head: "Regional head can create partners for their region.",
  partner: "Partner can create city heads for the cities they manage.",
  city_head: "City head takes ownership of assigned leads, updates follow-ups, and changes lead status.",
  data_entry: "Data entry captures new student inquiries and keeps the lead record accurate.",
};

// Kept in sync with the backend's utils/regions.js — every region and city
// here must exist there too, or a selection that looks valid in the UI
// will be rejected by the API as an "Invalid region" / "invalid city".
const CITIES_BY_REGION: Record<string, string[]> = {
  // ==========================
  // NORTH INDIA
  // ==========================
  "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  Haryana: ["Panipat", "Karnal", "Hisar", "Rohtak"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],

  // ==========================
  // SOUTH INDIA
  // ==========================
  "Coastal Karnataka": ["Mangaluru", "Udupi", "Karwar"],
  "North Karnataka": ["Hubballi", "Belagavi", "Kalaburagi", "Vijayapura"],

  Kerala: [
    "Kochi",
    "Thiruvananthapuram",
    "Kozhikode",
    "Kottayam",
  ],

  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
  ],

  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
  ],

  // ==========================
  // INTERNATIONAL
  // ==========================
  Nepal: [
    "Kathmandu",
    "Pokhara",
    "Lalitpur",
    "Biratnagar",
  ],

  Dubai: [
    "Dubai",
    "Sharjah",
    "Abu Dhabi",
  ],
};

// Zone -> the granular regions that fall under it. Co-admins are scoped to
// a whole zone rather than a single granular region.
const ZONES: Record<string, string[]> = {
  "North India": ["Delhi NCR", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"],
  "South India": ["Coastal Karnataka", "North Karnataka", "Tamil Nadu", "Kerala", "Telangana"],
  International: ["Nepal", "Dubai"],
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
    division: "",
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
      // Changing the role, region, or division invalidates any previously
      // chosen city/cities, since city options depend on region and city
      // fields only apply to certain roles.
      if (name === "region" || name === "division" || name === "role") {
        next.city = "";
        next.cities = [];
      }
      // Changing the role also invalidates any previously chosen
      // region/division, since a Co-Admin picks a division while every
      // other region-based role picks a region — they are never both
      // valid for the same role at once.
      if (name === "role") {
        next.region = "";
        next.division = "";
      }
      return next;
    });
  };

  const handleCityToggle = (city: string) => {
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter((item) => item !== city)
        : [...prev.cities, city],
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

  const isCoAdmin = form.role === "co_admin";
  const showRegion = useMemo(() => ["regional_head", "partner", "co_admin", "city_head"].includes(form.role), [form.role]);
  const showCity = form.role === "city_head";
  const showCities = form.role === "partner";
  const cityOptions = useMemo(() => (form.region ? CITIES_BY_REGION[form.region] || [] : []), [form.region]);

  // Roles the current user is allowed to create. Mirrors the backend's
  // roleHierarchy exactly:
  //   - Super Admin and Co-Admin both create: co_admin, regional_head,
  //     partner, city_head, data_entry. Neither can create "super_admin"
  //     — the system only ever has one, enforced on the backend — so it
  //     must never appear as a selectable option, even for Super Admin.
  //   - Regional Head only creates partners.
  //   - Partner only creates city heads.
  const allowedRoles = useMemo(() => {
    switch (user?.role) {
      case "super_admin":
      case "co_admin":
        return ["co_admin", "regional_head", "partner", "city_head", "data_entry"];
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
            <label className="block text-sm font-medium text-slate-700">{isCoAdmin ? "Zone" : "Region"}</label>
            <select name={isCoAdmin ? "division" : "region"} value={isCoAdmin ? form.division : form.region} onChange={handleChange} className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/40 px-3 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white">
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

            {!form.region ? (
              <p className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm text-slate-500">
                Select a region first to choose cities.
              </p>
            ) : (
              <div className="rounded-2xl border border-emerald-100 bg-white">
                {form.cities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 border-b border-emerald-100 bg-emerald-50/40 px-3 py-2.5">
                    {form.cities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => handleCityToggle(city)}
                          className="rounded-full text-emerald-100 transition hover:text-white"
                          aria-label={`Remove ${city}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="max-h-56 divide-y divide-emerald-50 overflow-y-auto">
                  {cityOptions.map((city) => {
                    const checked = form.cities.includes(city);
                    return (
                      <label
                        key={city}
                        className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition ${
                          checked ? "bg-emerald-50/70 text-emerald-800" : "text-slate-700 hover:bg-emerald-50/40"
                        }`}
                      >
                        <span>{city}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCityToggle(city)}
                          className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">{form.cities.length > 0 ? `${form.cities.length} ${form.cities.length === 1 ? "city" : "cities"} selected` : "No cities selected yet."}</p>
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
