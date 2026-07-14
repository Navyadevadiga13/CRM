import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentById, updateLeadStatus } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = ["Cold", "Warm", "Hot", "Converted", "Withdrawn"];

// Must match the model's expectedIntake enum ([3, 6, 9, 12]) — these are
// months-out-from-now, not years, so 6/12/18/24 was wrong and would always
// fail backend validation.
const INTAKE_OPTIONS = [3, 6, 9, 12];

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => currentYear + i);

const COUNTRIES = [
  "Australia",
  "Austria",
  "Canada",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dubai (UAE)",
  "Finland",
  "France",
  "Germany",
  "Hungary",
  "Ireland",
  "Italy",
  "Japan",
  "Latvia",
  "Lithuania",
  "Malaysia",
  "Malta",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Poland",
  "Portugal",
  "Singapore",
  "Slovakia",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
  "Other",
];

// Only these roles can change lead status at all (matches backend route).
const CAN_UPDATE_STATUS_ROLES = ["super_admin", "co_admin", "city_head"];

const statusBadgeClasses: Record<string, string> = {
  Cold: "bg-amber-100 text-amber-700",
  Warm: "bg-violet-100 text-violet-700",
  Hot: "bg-rose-100 text-rose-700",
  Converted: "bg-teal-100 text-teal-700",
  Withdrawn: "bg-slate-200 text-slate-700",
};

const LeadDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [statusForm, setStatusForm] = useState({
    leadStatus: "",
    expectedIntake: "",
    destinationCountry: "",
    withdrawalReason: "",
  });
  const [otherDestinationCountry, setOtherDestinationCountry] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const canUpdateStatus = CAN_UPDATE_STATUS_ROLES.includes(user?.role || "");

  const loadStudent = async () => {
    if (!id) return;
    try {
      const { data } = await getStudentById(id);
      setStudent(data.student);
      setStatusForm((prev) => ({
        ...prev,
        leadStatus: data.student.leadStatus || "Cold",
        expectedIntake: data.student.expectedIntake ? String(data.student.expectedIntake) : "",
        destinationCountry: data.student.destinationCountry || "",
        intakeMonth: data.student.intakeMonth ? String(data.student.intakeMonth) : "",
        intakeYear: data.student.intakeYear ? String(data.student.intakeYear) : "",
        withdrawalReason: data.student.withdrawalReason || "",
      }));
    } catch {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudent();
  }, [id]);

  const handleStatusFormChange = (event: any) => {
    const { name, value } = event.target;

    if (name === "destinationCountry" && value !== "Other") {
      // Clear any typed custom country if the user switches away from "Other"
      setOtherDestinationCountry("");
    }

    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusSubmit = async (event: any) => {
    event.preventDefault();
    if (!id) return;
    setStatusError("");
    setStatusMessage("");

    // Build payload with only the fields relevant to the target status.
    const payload: Record<string, unknown> = { leadStatus: statusForm.leadStatus };

    if (statusForm.leadStatus === "Warm") {
      if (!statusForm.expectedIntake) {
        setStatusError("Expected intake is required to mark a lead as Warm.");
        return;
      }
      payload.expectedIntake = Number(statusForm.expectedIntake);
    }

if (statusForm.leadStatus === "Converted") {
  const resolvedDestinationCountry =
    statusForm.destinationCountry === "Other"
      ? otherDestinationCountry.trim()
      : statusForm.destinationCountry.trim();

      if (!resolvedDestinationCountry) {
        setStatusError("Destination country is required to mark a lead as Converted.");
        return;
      }
      payload.destinationCountry = resolvedDestinationCountry;
    }

    if (statusForm.leadStatus === "Withdrawn") {
      if (!statusForm.withdrawalReason.trim()) {
        setStatusError("A withdrawal reason is required to mark a lead as Withdrawn.");
        return;
      }
      payload.withdrawalReason = statusForm.withdrawalReason.trim();
    }

    setStatusSaving(true);
    try {
      await updateLeadStatus(id, payload);
      await loadStudent();
      setStatusMessage(`Lead status successfully updated to ${statusForm.leadStatus}.`);
    } catch (err: any) {
      setStatusError(err.response?.data?.message || "Unable to update lead status.");
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading lead details...</div>;
  }

  if (!student) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">Lead not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lead details</h1>
          <p className="text-sm text-slate-500">Review all available student information and next actions.</p>
        </div>
        <Link to={`/students/edit/${student._id}`} className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Edit lead</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-slate-500">Name</p><p className="mt-1 font-semibold text-slate-900">{student.name}</p></div>
            <div><p className="text-sm text-slate-500">Email</p><p className="mt-1 font-semibold text-slate-900">{student.email}</p></div>
            <div><p className="text-sm text-slate-500">Contact number</p><p className="mt-1 font-semibold text-slate-900">{student.phone || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Study preference</p><p className="mt-1 font-semibold text-slate-900">{student.studyPreference}</p></div>
            <div><p className="text-sm text-slate-500">Preferred country</p><p className="mt-1 font-semibold text-slate-900">{student.preferredCountry || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Region</p><p className="mt-1 font-semibold text-slate-900">{student.region || "—"}</p></div>
            <div><p className="text-sm text-slate-500">City</p><p className="mt-1 font-semibold text-slate-900">{student.city}</p></div>

            <div>
              <p className="text-sm text-slate-500">Lead status</p>
              <p className="mt-1">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses[student.leadStatus || "Cold"] || "bg-slate-100 text-slate-700"}`}>
                  {student.leadStatus || "Cold"}
                </span>
              </p>
            </div>

            {student.leadStatus === "Warm" && student.expectedIntake ? (
              <div><p className="text-sm text-slate-500">Expected intake</p><p className="mt-1 font-semibold text-slate-900">{student.expectedIntake} months</p></div>
            ) : null}

            <div><p className="text-sm text-slate-500">Follow-up date</p><p className="mt-1 font-semibold text-slate-900">{student.followUpDate ? new Date(student.followUpDate).toLocaleDateString() : "—"}</p></div>

            {student.leadStatus === "Converted" ? (
              <>
                <div>
                  <p className="text-sm text-slate-500">Destination country</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {student.destinationCountry || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Intake month</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {student.intakeMonth
                      ? MONTH_OPTIONS.find((m) => m.value === student.intakeMonth)?.label || student.intakeMonth
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Intake year</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {student.intakeYear || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Conversion date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {student.conversionDate
                      ? new Date(student.conversionDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </>
            ) : null}

            {student.leadStatus === "Withdrawn" ? (
              <>
                <div><p className="text-sm text-slate-500">Withdrawal reason</p><p className="mt-1 font-semibold text-slate-900">{student.withdrawalReason || "—"}</p></div>
                <div><p className="text-sm text-slate-500">Withdrawal date</p><p className="mt-1 font-semibold text-slate-900">{student.withdrawalDate ? new Date(student.withdrawalDate).toLocaleDateString() : "—"}</p></div>
              </>
            ) : null}

            <div><p className="text-sm text-slate-500">Assigned partner</p><p className="mt-1 font-semibold text-slate-900">{student.assignedPartner?.name || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Assigned city head</p><p className="mt-1 font-semibold text-slate-900">{student.assignedCityHead?.name || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Created by</p><p className="mt-1 font-semibold text-slate-900">{student.createdBy?.name || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Created on</p><p className="mt-1 font-semibold text-slate-900">{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}</p></div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Remarks</p>
            <p className="mt-2 text-sm text-slate-700">{student.remarks || "No remarks added yet."}</p>
          </div>
        </div>

        {canUpdateStatus ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Update lead status</h2>
            <p className="mt-1 text-sm text-slate-500">Move this lead to a new stage in the pipeline.</p>

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              {statusMessage ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {statusMessage}
                </div>
              ) : null}
              {statusError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {statusError}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Lead status</label>
                <select
                  name="leadStatus"
                  value={statusForm.leadStatus}
                  onChange={handleStatusFormChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {statusForm.leadStatus === "Warm" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Expected intake</label>
                  <select
                    name="expectedIntake"
                    value={statusForm.expectedIntake}
                    onChange={handleStatusFormChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                  >
                    <option value="">Select intake</option>
                    {INTAKE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option} months</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {statusForm.leadStatus === "Converted" ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Destination country</label>
                    <select
                      name="destinationCountry"
                      value={statusForm.destinationCountry}
                      onChange={handleStatusFormChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {statusForm.destinationCountry === "Other" ? (
                      <input
                        value={otherDestinationCountry}
                        onChange={(e) => setOtherDestinationCountry(e.target.value)}
                        placeholder="Enter destination country"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                      />
                    ) : null}

<div className="mt-3">
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Intake Month
  </label>

  <select
    name="intakeMonth"
    value={statusForm.intakeMonth}
    onChange={handleStatusFormChange}
    className="w-full rounded-xl border border-slate-200 px-3 py-2"
  >
    <option value="">Select month</option>

    <option value="1">January</option>
    <option value="2">February</option>
    <option value="3">March</option>
    <option value="4">April</option>
    <option value="5">May</option>
    <option value="6">June</option>
    <option value="7">July</option>
    <option value="8">August</option>
    <option value="9">September</option>
    <option value="10">October</option>
    <option value="11">November</option>
    <option value="12">December</option>
  </select>
</div>
<div className="mt-3">
  <label className="mb-2 block text-sm font-medium text-slate-700">
    Intake Year
  </label>

  <input
    type="number"
    name="intakeYear"
    min="2025"
    max="2100"
    value={statusForm.intakeYear}
    onChange={handleStatusFormChange}
    placeholder="2027"
    className="w-full rounded-xl border border-slate-200 px-3 py-2"
  />
</div>

                    
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Intake month</label>
                      <select
                        name="intakeMonth"
                        value={statusForm.intakeMonth}
                        onChange={handleStatusFormChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                      >
                        <option value="">Month</option>
                        {MONTH_OPTIONS.map((month) => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Intake year</label>
                      <select
                        name="intakeYear"
                        value={statusForm.intakeYear}
                        onChange={handleStatusFormChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                      >
                        <option value="">Year</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : null}

              {statusForm.leadStatus === "Withdrawn" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Withdrawal reason</label>
                  <textarea
                    name="withdrawalReason"
                    value={statusForm.withdrawalReason}
                    onChange={handleStatusFormChange}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                  />
                </div>
              ) : null}

              <button
                type="submit"
                disabled={statusSaving}
                className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
              >
                {statusSaving ? "Updating..." : "Update status"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default LeadDetailsPage;
