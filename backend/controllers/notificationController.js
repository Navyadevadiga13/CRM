import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("relatedStudent", "name")
      .sort({ createdAt: -1 });
      
    const unreadCount = await Notification.countDocuments({
       recipient: req.user._id,
       isRead: false,
});

    res.status(200).json({
      success: true,
      unreadCount,
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
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    // Prevent users from marking someone else's notification
    if (
      notification.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
    });
  }
};