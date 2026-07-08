import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteUser, getUsers, toggleUserStatus } from "../../api/userApi";

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
      setMessage("User status updated.");
      loadUsers();
    } catch {
      setMessage("Unable to update user status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setMessage("User deleted successfully.");
      loadUsers();
    } catch {
      setMessage("Unable to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">Manage staff and role-based access.</p>
        </div>
        <Link to="/users/create" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
          Create role
        </Link>
      </div>

      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No users available.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role?.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/users/edit/${user._id}`} className="text-sm font-medium text-amber-600">
                        Edit
                      </Link>
                      <button onClick={() => handleToggleStatus(user._id)} className="flex items-center gap-2 text-sm font-medium text-cyan-600" aria-label={`Toggle ${user.name} status`}>
                        <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${user.isActive ? "bg-emerald-600" : "bg-slate-300"}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${user.isActive ? "translate-x-5" : "translate-x-1"}`} />
                        </span>
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="text-sm font-medium text-rose-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;

