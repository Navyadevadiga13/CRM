import { logLeadActivity } from "./leadActivity.js";
import { createNotification } from "./notificationService.js";
export const handleLeadCreated = async (student, user) => {
  console.log("================================");
  console.log("LEAD CREATED AUTOMATION STARTED");
  console.log("Student ID:", student._id);
  console.log("Name:", student.name);
  console.log("Email:", student.email);
  console.log("Phone:", student.phone);
  console.log("================================");

  await logLeadActivity(
     student,
     "Lead Created",
     "Lead added successfully",
     user?.name || "System"
);
await createNotification({
  recipient: user._id,
  relatedStudent: student._id,
  type: "lead",
  title: "Lead Created",
  message: `Lead successfully added!`,
});
};
