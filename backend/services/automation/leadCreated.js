import { logLeadActivity } from "./leadActivity.js";

export const handleLeadCreated = async (student, user) => {
  console.log("================================");
  console.log("LEAD CREATED AUTOMATION STARTED");
  console.log("Student ID:", student._id);
  console.log("Name:", student.name);
  console.log("Email:", student.email);
  console.log("Phone:", student.phone);
  console.log("================================");

  await logLeadActivity(student, "Lead Created", user?.name || "System");
};
