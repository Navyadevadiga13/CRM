import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { createUser } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

export default function CreateUserPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    region: "",
    cities: "",
  });

  const [loading, setLoading] = useState(false);

  const roleOptions: Record<string, string[]> = {
    super_admin: ["co_admin"],
    co_admin: ["regional_head", "data_entry"],
    regional_head: ["partner", "data_entry"],
    partner: ["city_head", "data_entry"],
    city_head: ["data_entry"],
    data_entry: [],
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createUser({
        ...form,
        cities: form.cities
          ? form.cities
              .split(",")
              .map((city) => city.trim())
          : [],
      });

      alert("User created successfully.");

      navigate("/users");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to create user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-8 text-3xl font-bold">
          Create User
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6"
        >

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="rounded-lg border p-3"
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-lg border p-3"
            required
          >
            <option value="">
              Select Role
            </option>

            {(roleOptions[user?.role || ""] || []).map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}

          </select>

          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            placeholder="Region"
            className="rounded-lg border p-3"
          />

          <input
            name="cities"
            value={form.cities}
            onChange={handleChange}
            placeholder="Cities (comma separated)"
            className="rounded-lg border p-3"
          />

          <button
            disabled={loading}
            className="rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create User"}
          </button>

        </form>

      </div>
    </DashboardLayout>
  );
}