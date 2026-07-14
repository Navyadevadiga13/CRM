import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentById, updateLeadStatus } from "../../api/studentApi";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = ["Cold", "Warm", "Hot", "Converted", "Withdrawn"];
const INTAKE_OPTIONS = [6, 12, 18, 24];

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

const LeadDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

const [statusForm, setStatusForm] = useState({
  leadStatus: "",
  expectedIntake: "",
  destinationCountry: "",
  intakeMonth: "",
  intakeYear: "",
  withdrawalReason: "",
});
  const [otherDestinationCountry, setOtherDestinationCountry] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const canUpdateStatus = CAN_UPDATE_STATUS_ROLES.includes(user?.role || "");

  const loadStudent = async () => {
    if (!id) return;
    try {
      const { data } = await getStudentById(id);
      setStudent(data.student);
      setStatusForm((prev) => ({ ...prev, leadStatus: data.student.leadStatus || "Cold" }));
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
    setStatusError("Destination country is required.");
    return;
  }

  if (!statusForm.intakeMonth) {
    setStatusError("Please select an intake month.");
    return;
  }

  if (!statusForm.intakeYear) {
    setStatusError("Please enter an intake year.");
    return;
  }

  payload.destinationCountry = resolvedDestinationCountry;
  payload.intakeMonth = Number(statusForm.intakeMonth);
  payload.intakeYear = Number(statusForm.intakeYear);
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
            <div><p className="text-sm text-slate-500">Phone</p><p className="mt-1 font-semibold text-slate-900">{student.phone}</p></div>
            <div><p className="text-sm text-slate-500">Study preference</p><p className="mt-1 font-semibold text-slate-900">{student.studyPreference}</p></div>
            <div><p className="text-sm text-slate-500">Preferred country</p><p className="mt-1 font-semibold text-slate-900">{student.preferredCountry || "—"}</p></div>
            <div><p className="text-sm text-slate-500">Region</p><p className="mt-1 font-semibold text-slate-900">{student.region || "—"}</p></div>
            <div><p className="text-sm text-slate-500">City</p><p className="mt-1 font-semibold text-slate-900">{student.city}</p></div>
            <div><p className="text-sm text-slate-500">Lead status</p><p className="mt-1 font-semibold text-slate-900">{student.leadStatus || "Cold"}</p></div>

            {student.leadStatus === "Warm" && student.expectedIntake ? (
              <div><p className="text-sm text-slate-500">Expected intake</p><p className="mt-1 font-semibold text-slate-900">{student.expectedIntake} months</p></div>
            ) : null}

            <div><p className="text-sm text-slate-500">Follow-up date</p><p className="mt-1 font-semibold text-slate-900">{student.followUpDate ? new Date(student.followUpDate).toLocaleDateString() : "—"}</p></div>

            {student.leadStatus === "Converted" ? (
              <>
                <div><p className="text-sm text-slate-500">Destination country</p><p className="mt-1 font-semibold text-slate-900">{student.destinationCountry || "—"}</p></div>
                <div><p className="text-sm text-slate-500">Conversion date</p><p className="mt-1 font-semibold text-slate-900">{student.conversionDate ? new Date(student.conversionDate).toLocaleDateString() : "—"}</p></div>
              </>
            ) : null}

            {student.leadStatus === "Withdrawn" ? (
              <>
                <div><p className="text-sm text-slate-500">Withdrawal reason</p><p className="mt-1 font-semibold text-slate-900">{student.withdrawalReason || "—"}</p></div>
                <div><p className="text-sm text-slate-500">Withdrawal date</p><p className="mt-1 font-semibold text-slate-900">{student.withdrawalDate ? new Date(student.withdrawalDate).toLocaleDateString() : "—"}</p></div>
              </>
            ) : null}

            <div><p className="text-sm text-slate-500">Created by</p><p className="mt-1 font-semibold text-slate-900">{student.createdBy?.name || "—"}</p></div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Remarks</p>
            <p className="mt-2 text-sm text-slate-700">{student.remarks || "No remarks added yet."}</p>
          </div>
        </div>

        <div className="space-y-6">
          {canUpdateStatus ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Update lead status</h2>
              <p className="mt-1 text-sm text-slate-500">Move this lead through the pipeline.</p>

              <form onSubmit={handleStatusSubmit} className="mt-4 space-y-3">
                {statusError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{statusError}</div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                  <select
                    name="leadStatus"
                    value={statusForm.leadStatus}
                    onChange={handleStatusFormChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {statusForm.leadStatus === "Warm" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Expected intake</label>
                    <select
                      name="expectedIntake"
                      value={statusForm.expectedIntake}
                      onChange={handleStatusFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select months</option>
                      {INTAKE_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m} months</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {statusForm.leadStatus === "Converted" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Destination country</label>
                    <select
                      name="destinationCountry"
                      value={statusForm.destinationCountry}
                      onChange={handleStatusFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {statusForm.destinationCountry === "Other" ? (
                      <input
                        name="otherDestinationCountry"
                        value={otherDestinationCountry}
                        onChange={(e) => setOtherDestinationCountry(e.target.value)}
                        placeholder="Enter country"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                ) : null}

                {statusForm.leadStatus === "Withdrawn" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Withdrawal reason</label>
                    <textarea
                      name="withdrawalReason"
                      rows={3}
                      value={statusForm.withdrawalReason}
                      onChange={handleStatusFormChange}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={statusSaving}
                  className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {statusSaving ? "Updating..." : "Update status"}
                </button>
              </form>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 space-y-3">
              <Link to="/students" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to leads</Link>
              <Link to="/students/create" className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Create another lead</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadDetailsPage;