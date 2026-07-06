import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  getStudent,
  updateStudent,
} from "../../api/studentApi";

export default function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    interestedCountry: "",
    intakeMonth: "",
    intakeYear: "",
    remarks: "",
  });

  useEffect(() => {
    loadLead();
  }, []);

  const loadLead = async () => {
    try {
      const data = await getStudent(id!);

      setForm({
        name: data.student.name,
        email: data.student.email,
        phone: data.student.phone,
        interestedCountry: data.student.interestedCountry || "",
        intakeMonth: data.student.intakeMonth || "",
        intakeYear: data.student.intakeYear || "",
        remarks: data.student.remarks || "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
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

      await updateStudent(id!, form);

      alert("Lead updated successfully.");

      navigate("/students");

    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to update lead."
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

      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-8 text-3xl font-bold">
          Edit Lead
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-2"
        >

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Name"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Email"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Phone"
          />

          <input
            name="interestedCountry"
            value={form.interestedCountry}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Interested Country"
          />

          <input
            name="intakeMonth"
            value={form.intakeMonth}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Intake Month"
          />

          <input
            name="intakeYear"
            value={form.intakeYear}
            onChange={handleChange}
            className="rounded-lg border p-3"
            placeholder="Intake Year"
          />

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={5}
            className="rounded-lg border p-3 md:col-span-2"
            placeholder="Remarks"
          />

          <button
            disabled={saving}
            className="rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 md:col-span-2"
          >
            {saving ? "Updating..." : "Update Lead"}
          </button>

        </form>

      </div>

    </DashboardLayout>
  );
}