import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await login(email, password);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-2">

        {/* Left */}

        <div className="hidden lg:flex bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white p-14 flex-col justify-between">

          <div>

            <h1 className="text-5xl font-bold tracking-wide">
              WizX CRM
            </h1>

            <p className="mt-4 text-blue-100 text-lg">
              Overseas Education Consultancy
            </p>

          </div>

          <div>

            <h2 className="text-4xl font-bold leading-tight">
              Manage Leads.
              <br />
              Convert Students.
              <br />
              Grow Faster.
            </h2>

            <p className="mt-6 text-blue-100 leading-8">
              A modern CRM built exclusively for overseas
              education consultancies.
            </p>

          </div>

          <div className="text-blue-200 text-sm">
            © 2026 WizX CRM
          </div>

        </div>

        {/* Right */}

        <div className="p-10 lg:p-16 flex flex-col justify-center">

          <div className="mb-10">

            <h2 className="text-4xl font-bold text-slate-800">
              Welcome Back
            </h2>

            <p className="text-slate-500 mt-3">
              Login to continue.
            </p>

          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-100 border border-red-200 text-red-600 px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <div>

              <label className="block mb-2 font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                autoComplete="email"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
              />

            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? "Signing In..." : "Login"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}