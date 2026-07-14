import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      // Don't decide the destination here — App.tsx's root route already
      // redirects an authenticated user to their correct home via
      // homePathForRole(user?.role). Keeping that logic in one place
      // avoids this exact kind of mismatch/stale-redirect bug.
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.24),_transparent_35%),linear-gradient(135deg,_#f5fff9_0%,_#eefbf2_100%)] px-4 py-8 text-slate-800 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.12)] lg:flex-row">
        <div className="flex-1 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">EduCRM login</p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Manage overseas education leads with real-world role-based access.</h1>
          <p className="mt-4 text-sm leading-6 text-emerald-50/90">
            Super admins create roles, regional heads manage partners, partners route city heads, and city heads move leads through follow-up and status updates.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { title: "Super admin", text: "Create co-admins, regional heads, partners, and data-entry users." },
              { title: "Regional head", text: "Create partners and oversee a region’s lead flow." },
              { title: "Partner", text: "Assign city heads and keep local follow-up moving." },
              { title: "City head", text: "Update remarks, follow-up dates, and lead status." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/20 bg-white/15 p-3 backdrop-blur">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-emerald-50/90">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 lg:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your assigned email and password to access the dashboard.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">How role creation works</p>
            <p className="mt-1">A super admin or senior manager creates the next role in the chain, and each new account gets its own email/password to log in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;