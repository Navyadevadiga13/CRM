import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { getUser, updateUser } from "../../api/userApi";

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    region: "",
    cities: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUser(id!);

      setForm({
        name: data.user.name,
        phone: data.user.phone,
        region: data.user.region || "",
        cities: data.user.cities
          ? data.user.cities.join(", ")
          : "",
      });
    } catch (error) {
      console.error(error);
      alert("Unable to load user.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateUser(id!, {
        name: form.name,
        phone: form.phone,
        region: form.region,
        cities: form.cities
          ? form.cities
              .split(",")
              .map((city) => city.trim())
          : [],
      });

      alert("User updated successfully.");

      navigate("/users");

    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to update user."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-8 text-3xl font-bold">
          Edit User
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
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-lg border p-3"
          />

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
            placeholder="Cities"
            className="rounded-lg border p-3"
          />

          <button
            disabled={saving}
            className="rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            {saving ? "Updating..." : "Update User"}
          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}