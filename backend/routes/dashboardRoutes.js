import express from "express";

import { getDashboard } from "../controllers/dashboardController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  getDashboard
);

export default router;