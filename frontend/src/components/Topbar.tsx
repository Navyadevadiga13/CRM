import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">

      <div>

        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          Welcome back, {user?.name}
        </p>

      </div>

      <div className="flex items-center gap-5">

        <div className="text-right">

          <h3 className="font-semibold text-slate-800">
            {user?.name}
          </h3>

          <p className="text-sm capitalize text-slate-500">
            {user?.role?.replace("_", " ")}
          </p>

        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
        >
          Logout
        </button>

      </div>

    </header>
  );
}