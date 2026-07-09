import LeadActivity from "../../models/LeadActivity.js";

export const logLeadActivity = async (
  student,
  action,
  performedBy = "System"
) => {
  try {
    await LeadActivity.create({
      student: student._id,
      action,
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