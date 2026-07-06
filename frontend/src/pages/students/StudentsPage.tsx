import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  getStudents,
  deleteStudent,
  toggleStudentStatus,
} from "../../api/studentApi";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data.students);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await deleteStudent(id);
      alert("Lead deleted successfully.");
      loadStudents();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to delete lead."
      );
    }
  };

  const handleStatus = async (id: string) => {
    try {
      await toggleStudentStatus(id);
      loadStudents();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to update status."
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      student.phone?.includes(search);

    const matchesStatus =
      !statusFilter ||
      student.leadStatus === statusFilter;

    const matchesCountry =
      !countryFilter ||
      student.interestedCountry === countryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCountry
    );
  });

  return (
    <DashboardLayout>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Leads
          </h1>

          <p className="text-slate-500">
            Manage all consultancy leads
          </p>

        </div>

        <Link
          to="/students/create"
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + Create Lead
        </Link>

      </div>

      {/* Filters */}

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name or phone..."
          className="rounded-lg border p-3"
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-lg border p-3"
        >
          <option value="">
            All Status
          </option>

          <option value="cold">
            Cold
          </option>

          <option value="warm">
            Warm
          </option>

          <option value="hot">
            Hot
          </option>

          <option value="converted">
            Converted
          </option>

        </select>

        <input
          value={countryFilter}
          onChange={(e) =>
            setCountryFilter(e.target.value)
          }
          placeholder="Country"
          className="rounded-lg border p-3"
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-white shadow">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-6 py-4 text-left">
                Name
              </th>

              <th className="px-6 py-4 text-left">
                Phone
              </th>

              <th className="px-6 py-4 text-left">
                Country
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
                  colSpan={5}
                  className="p-10 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : filteredStudents.length === 0 ? (

              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center"
                >
                  No Leads Found
                </td>
              </tr>

            ) : (

              filteredStudents.map((student) => (

                <tr
                  key={student._id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-medium">
                    {student.name}
                  </td>

                  <td className="px-6 py-4">
                    {student.phone}
                  </td>

                  <td className="px-6 py-4">
                    {student.interestedCountry}
                  </td>

                  <td className="px-6 py-4">

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {student.leadStatus}
                    </span>

                  </td>

                  <td className="space-x-2 px-6 py-4 text-center">

                    <Link
                      to={`/students/edit/${student._id}`}
                      className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleStatus(student._id)
                      }
                      className="rounded bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600"
                    >
                      Status
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(student._id)
                      }
                      className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
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