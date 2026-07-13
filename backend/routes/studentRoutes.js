import express from "express";

import {
  createStudent,
  getStudents,
  searchStudents,
  filterStudents,
  getStudentById,
  updateStudent,
  updateLeadStatus,
  assignPartner,
  assignCityHead,
  updateRemarks,
  updateFollowUp,
  toggleStudentStatus,
  deleteStudent,
} from "../controllers/studentController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

router.post(
  "/create",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  createStudent
);

/*
|--------------------------------------------------------------------------
| Get All Leads
|--------------------------------------------------------------------------
*/

router.get(
  "/all",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  getStudents
);

/*
|--------------------------------------------------------------------------
| Search Leads
|--------------------------------------------------------------------------
*/

router.get(
  "/search",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  searchStudents
);

/*
|--------------------------------------------------------------------------
| Filter Leads
|--------------------------------------------------------------------------
*/

router.get(
  "/filter",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  filterStudents
);

/*
|--------------------------------------------------------------------------
| Get Lead By ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  getStudentById
);

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

router.put(
  "/update/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  updateStudent
);

/*
|--------------------------------------------------------------------------
| Update Lead Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/status/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "city_head"
  ),
  updateLeadStatus
);

/*
|--------------------------------------------------------------------------
| Assign Partner
|--------------------------------------------------------------------------
*/

router.patch(
  "/assign-partner/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head"
  ),
  assignPartner
);

/*
|--------------------------------------------------------------------------
| Assign City Head
|--------------------------------------------------------------------------
*/

router.patch(
  "/assign-city-head/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  assignCityHead
);

/*
|--------------------------------------------------------------------------
| Update Remarks
|--------------------------------------------------------------------------
*/

router.patch(
  "/remarks/:id",
  protect,
 authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  updateRemarks
);

/*
|--------------------------------------------------------------------------
| Update Follow-up
|--------------------------------------------------------------------------
*/

router.patch(
  "/followup/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner",
    "city_head",
    "data_entry"
  ),
  updateFollowUp
);

/*
|--------------------------------------------------------------------------
| Activate / Deactivate Lead
|--------------------------------------------------------------------------
*/

router.patch(
  "/toggle/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head"
  ),
  toggleStudentStatus
);

/*
|--------------------------------------------------------------------------
| Delete Lead
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head"
  ),
  deleteStudent
);

export default router;