import LeadActivity from "../../models/LeadActivity.js";

export const logLeadActivity = async (
  student,
  action,
  details = "",
  performedBy = "System"
) => {
  try {
    await LeadActivity.create({
        student: student._id,
        action,
        details,
        performedBy,
    });

    console.log("[Automation] Activity saved:", action);
  } catch (error) {
    console.error(
      "[Automation] Failed to save activity:",
      error.message
    );
  }
};