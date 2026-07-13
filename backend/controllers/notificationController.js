import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("relatedStudent", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch notifications.",
    });
  }
};