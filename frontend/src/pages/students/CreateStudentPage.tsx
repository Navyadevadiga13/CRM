import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import { createStudent } from "../../api/studentApi";

export default function CreateStudentPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    city: "",
    interestedCountry: "",
    intakeMonth: "",
    intakeYear: "",
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

      await createStudent(form);

      alert("Lead created successfully.");

      navigate("/students");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to create lead."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">

        <h1 className="mb-8 text-3xl font-bold">
          Create Lead
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-2"
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
            type="email"
            name="email"
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
            placeholder="Phone Number"
            className="rounded-lg border p-3"
            required
          />

          <select
            name="region"
            value={form.region}
            onChange={handleChange}
            className="rounded-lg border p-3"
            required
          >
            <option value="">Select Region</option>
            <option value="North India">North India</option>
            <option value="South India">South India</option>
            <option value="Nepal Region">Nepal Region</option>
          </select>

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="interestedCountry"
            value={form.interestedCountry}
            onChange={handleChange}
            placeholder="Interested Country"
            className="rounded-lg border p-3"
            required
          />

          <select
            name="intakeMonth"
            value={form.intakeMonth}
            onChange={handleChange}
            className="rounded-lg border p-3"
            required
          >
            <option value="">Select Intake Month</option>

            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

          <input
            name="intakeYear"
            value={form.intakeYear}
            onChange={handleChange}
            placeholder="Intake Year"
            className="rounded-lg border p-3"
            required
          />

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={4}
            placeholder="Remarks"
            className="rounded-lg border p-3 md:col-span-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 md:col-span-2"
          >
            {loading ? "Creating..." : "Create Lead"}
          </button>

        </form>

      </div>
    </DashboardLayout>
  );
}