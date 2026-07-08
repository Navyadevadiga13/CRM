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
    "city_head",
    "data_entry",
  ],

  co_admin: [
    "regional_head",
    "partner",
    "city_head",
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

const CITY_OPTIONS_BY_REGION = {
  "North India": ["Delhi", "Noida", "Jaipur", "Lucknow", "Chandigarh"],
  "South India": ["Bangalore", "Hyderabad", "Chennai", "Kochi", "Mangalore"],
  "Nepal Region": ["Kathmandu", "Pokhara", "Lalitpur"],
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

const isValidCityForRegion = (city, region) => {
  const allowedCities = CITY_OPTIONS_BY_REGION[region] || [];
  return allowedCities.includes(city);
};

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

    // Required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // Phone validation
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Role hierarchy validation
    const allowedRoles = roleHierarchy[req.user.role] || [];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create this user.",
      });
    }

    // Region validation
    if (
      (role === "regional_head" || role === "partner") &&
      (!region || !VALID_REGIONS.includes(region.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid region is required.",
      });
    }

    // City validation
    if (role === "city_head") {
      const trimmedCity = city?.trim();
      if (!trimmedCity) {
        return res.status(400).json({
          success: false,
          message: "City is required.",
        });
      }

      if (!isValidCityForRegion(trimmedCity, region?.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please choose a valid city for the selected region.",
        });
      }
    }

    // Partner cities validation
    if (role === "partner") {
      const normalizedCities = Array.isArray(cities)
        ? cities.map((item) => item.trim()).filter(Boolean)
        : [];

      if (normalizedCities.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Partner must have at least one city.",
        });
      }

      const invalidCities = normalizedCities.filter((item) => !isValidCityForRegion(item, region?.trim()));
      if (invalidCities.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please choose valid cities for the selected region.",
        });
      }
    }

    // Existing user check
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existingUser) {
      const duplicateField = existingUser.email === normalizedEmail ? "email" : "phone";
      return res.status(409).json({
        success: false,
        message: duplicateField === "email"
          ? "A user with this email already exists."
          : "A user with this phone already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,

      region:
        role === "regional_head" || role === "partner"
          ? region.trim()
          : null,

      city:
        role === "city_head"
          ? city.trim()
          : null,

      cities:
        role === "partner"
          ? Array.isArray(cities)
            ? cities.map((c) => c.trim()).filter(Boolean)
            : []
          : [],

      createdBy: req.user._id,
    });

    // Remove password before sending response
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      region: user.region,
      city: user.city,
      cities: user.cities,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: safeUser,
    });

  } catch (error) {
    console.error("createUser error:", error);

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

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 20, 1),
      100
    );
    const skip = (page - 1) * limit;

    const filter = {};

    // Regional Head
    if (loggedInUser.role === "regional_head") {
      filter.region = loggedInUser.region;
      filter.role = {
        $in: ["partner", "city_head"],
      };
    }

    // Partner
    if (loggedInUser.role === "partner") {
      filter.role = "city_head";
      filter.city = {
        $in: loggedInUser.cities,
      };
    }

    // City Head & Data Entry cannot view users
    if (
      loggedInUser.role === "city_head" ||
      loggedInUser.role === "data_entry"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("getUsers error:", error);

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

    if (phone && phone.trim() !== user.phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }
      const existingUserWithPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
      if (existingUserWithPhone) {
        return res.status(409).json({
      success: false,
          message: "A user with this phone already exists.",
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
        const trimmedCity = city.trim();
        if (!isValidCityForRegion(trimmedCity, user.region?.trim())) {
      return res.status(400).json({
        success: false,
            message: "Please choose a valid city for the selected region.",
      });
    }
        user.city = trimmedCity;
      }
    }

    if (
      user.role === "partner"
    ) {
      if (cities) {
        const normalizedCities = Array.isArray(cities)
          ? cities.map((item) => item.trim()).filter(Boolean)
          : [];

        if (normalizedCities.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Partner must have at least one city.",
    });
        }

        const invalidCities = normalizedCities.filter((item) => !isValidCityForRegion(item, user.region?.trim()));
        if (invalidCities.length > 0) {
          return res.status(400).json({
      success: false,
            message: "Please choose valid cities for the selected region.",
    });
  }
        user.cities = normalizedCities;
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

    if (req.user.role === "co_admin" && user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Co Admin cannot manage the Super Admin account.",
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

    if (req.user.role === "co_admin" && user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Co Admin cannot delete the Super Admin account.",
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
