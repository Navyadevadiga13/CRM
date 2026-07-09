import express from "express";

import { getLeadActivities } from "../controllers/activityController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/:studentId",
  protect,
  getLeadActivities
);

export default router;