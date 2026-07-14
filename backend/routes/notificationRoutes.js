import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markNotificationAsRead);
router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);
export default router;