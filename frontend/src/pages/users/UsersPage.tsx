import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getUsers,
  deleteUser,
  toggleUserStatus,
} from "../../api/userApi";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);

      alert("User deleted successfully.");

      loadUsers();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  const handleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);

      loadUsers();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to update status."
      );
    }
  };

  return (
    <DashboardLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="text-slate-500">
            Manage CRM Users
          </p>

        </div>

        <Link
          to="/users/create"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Create User
        </Link>

      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-6 py-4 text-left">
                Name
              </th>

              <th className="px-6 py-4 text-left">
                Email
              </th>

              <th className="px-6 py-4 text-left">
                Phone
              </th>

              <th className="px-6 py-4 text-left">
                Role
              </th>

              <th className="px-6 py-4 text-left">
                Status
              </th>

              <th className="px-6 py-4 text-center">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-10 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : users.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-10 text-center"
                >
                  No Users Found
                </td>

              </tr>

            ) : (

              users.map((user) => (

                <tr
                  key={user._id}
                  className="border-t"
                >

                  <td className="px-6 py-4">
                    {user.name}
                  </td>

                  <td className="px-6 py-4">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    {user.phone}
                  </td>

                  <td className="px-6 py-4 capitalize">
                    {user.role.replaceAll("_", " ")}
                  </td>

                  <td className="px-6 py-4">

                    {user.isActive ? (

                      <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                        Active
                      </span>

                    ) : (

                      <span className="rounded bg-red-100 px-3 py-1 text-red-700">
                        Inactive
                      </span>

                    )}

                  </td>

                  <td className="space-x-2 px-6 py-4 text-center">

                    <Link
                      to={`/users/edit/${user._id}`}
                      className="rounded bg-blue-500 px-3 py-2 text-white"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleStatus(user._id)
                      }
                      className="rounded bg-yellow-500 px-3 py-2 text-white"
                    >
                      Status
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(user._id)
                      }
                      className="rounded bg-red-500 px-3 py-2 text-white"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}