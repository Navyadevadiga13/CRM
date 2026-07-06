import bcrypt from "bcryptjs";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Role Hierarchy
|--------------------------------------------------------------------------
*/

const roleHierarchy = {
  super_admin: [
    "co_admin",
    "regional_head",
    "partner",
    "data_entry",
  ],

  co_admin: [
    "regional_head",
    "partner",
    "data_entry",
  ],

  regional_head: [
    "partner",
  ],

  partner: [
    "city_head",
  ],

  city_head: [],

  data_entry: [],
};

const VALID_REGIONS = [
  "North India",
  "South India",
  "Nepal Region",
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      region,
      city,
      cities,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    const allowedRoles =
      roleHierarchy[req.user.role] || [];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create this user.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email: email.toLowerCase(),
        },
        {
          phone,
        },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),

      email: email.toLowerCase().trim(),

      phone: phone.trim(),

      password: hashedPassword,

      role,

      region:
        role === "regional_head" ||
        role === "partner"
          ? region
          : null,

      city:
        role === "city_head"
          ? city
          : null,

      cities:
        role === "partner"
          ? cities || []
          : [],

      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }
};

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/

export const getUsers = async (req, res) => {
  try {

    const loggedInUser = req.user;

    let filter = {};

    if (loggedInUser.role === "regional_head") {

      filter.region =
        loggedInUser.region;

      filter.role = {
        $in: [
          "partner",
          "city_head",
        ],
      };
    }

    if (loggedInUser.role === "partner") {

      filter.role = "city_head";

      filter.city = {
        $in:
          loggedInUser.cities,
      };
    }

    if (loggedInUser.role === "city_head") {

      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });

    }

    const users = await User.find(filter)
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }
};

/*
|--------------------------------------------------------------------------
| Get User By ID
|--------------------------------------------------------------------------
*/

export const getUserById = async (req, res) => {

  try {

    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

};

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      region,
      city,
      cities,
      isActive,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) {
      user.name = name.trim();
    }

    if (phone) {

      if (!isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }

      user.phone = phone.trim();
    }

    if (
      user.role === "regional_head" ||
      user.role === "partner"
    ) {
      if (region) {
        user.region = region;
      }
    }

    if (
      user.role === "city_head"
    ) {
      if (city) {
        user.city = city.trim();
      }
    }

    if (
      user.role === "partner"
    ) {
      if (cities) {
        user.cities = cities;
      }
    }

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    user.updatedBy = req.user._id;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }
};

/*
|--------------------------------------------------------------------------
| Activate / Deactivate User
|--------------------------------------------------------------------------
*/

export const toggleUserStatus = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin cannot be deactivated.",
      });
    }

    user.isActive = !user.isActive;

    user.updatedBy = req.user._id;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive
          ? "activated"
          : "deactivated"
      } successfully.`,
      user,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

};

/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
*/

export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    }

    if (user.role === "super_admin") {

      return res.status(403).json({
        success: false,
        message: "Super Admin cannot be deleted.",
      });

    }

    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {

      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });

    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }

};