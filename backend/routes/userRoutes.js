import express from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../controllers/userController.js";

import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/
router.post(
  "/create",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  createUser
);

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/
router.get(
  "/all",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  getUsers
);

/*
|--------------------------------------------------------------------------
| Get User By ID
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  getUserById
);

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/
router.put(
  "/update/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  updateUser
);

/*
|--------------------------------------------------------------------------
| Activate / Deactivate User
|--------------------------------------------------------------------------
*/
router.patch(
  "/status/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin",
    "regional_head",
    "partner"
  ),
  toggleUserStatus
);

/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "co_admin"
  ),
  deleteUser
);

export default router;