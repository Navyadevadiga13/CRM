import Notification from "../../models/Notification.js";

export const createNotification = async ({
  recipient,
  relatedStudent = null,
  type,
  title,
  message,
}) => {
  try {
    await Notification.create({
      recipient,
      relatedStudent,
      type,
      title,
      message,
    });

    console.log("[Notification] Created:", title);
  } catch (error) {
    console.error("[Notification] Failed:", error.message);
  }
};