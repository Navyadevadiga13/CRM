import bcrypt from "bcryptjs";
import User, { DIVISIONS } from "../models/User.js";
import {
  isValidRegion,
  isValidCityForRegion,
} from "../utils/regions.js";
/*
|--------------------------------------------------------------------------
| Role Hierarchy
|--------------------------------------------------------------------------
| - Regional Head creates City Heads *and* Partners.
| - Partner creates no one (Partners aren't responsible for hiring/lead
|   management, only for owning cities).
*/
// Roles that Super Admin and Co-Admin can both create. They have
// identical creation permissions across the entire hierarchy — the only
// real differences between the two are enforced elsewhere:
//   - Only Super Admin can activate/deactivate or delete a user
//     (see toggleUserStatus / deleteUser).
//   - Co-Admin can never view, edit, activate/deactivate, or delete the
//     Super Admin account (see isUserInScope).
// Previously `super_admin` was missing "city_head" here, which caused
// "You are not allowed to create this role." when a Super Admin tried
// to create a City Head even though Co-Admin (and the front-end role
// picker) already allowed it.
const ADMIN_MANAGEABLE_ROLES = [
  "co_admin",
  "regional_head",
  "partner",
  "city_head",
  "data_entry",
];

const roleHierarchy = {
  super_admin: ADMIN_MANAGEABLE_ROLES,
  co_admin: ADMIN_MANAGEABLE_ROLES,

  regional_head: [
    "city_head",
    "partner",
  ],
  partner: [],
  city_head: [],
  data_entry: [],
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

const needsRegion = (role) =>
  role === "regional_head" || role === "partner" || role === "city_head";
/*
|--------------------------------------------------------------------------
| Role-based user scoping
|--------------------------------------------------------------------------
| Route-level `authorize` only confirms the caller's role is generally
| allowed to hit an endpoint, not that the *specific target user* is in
| their territory. Without this, a Regional Head could edit a Partner or
| City Head in a different region, and a Partner could edit any City Head
| account system-wide.
*/
const isUserInScope = (actor, target) => {
  switch (actor.role) {
    case "super_admin":
      return true;

    case "co_admin":
      // Co-Admin has identical view/edit/manage access to Super Admin for
      // every other account — it is intentionally NOT scoped to the
      // Co-Admin's own division/region. The single carve-out is that a
      // Co-Admin can never view, edit, activate/deactivate, or delete
      // the Super Admin account itself.
      return target.role !== "super_admin";

    case "regional_head":
      return (
        target.region === actor.region &&
        (target.role === "partner" || target.role === "city_head")
      );

    case "partner":
      return (
        target.role === "city_head" &&
        (actor.cities || []).includes(target.city)
      );

    default:
      return false;
  }
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
      division,
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

    // Division validation — Co-Admin only. This is the top-level, 3-value
    // field (North India / South India / International); it is never
    // free text.
    if (role === "co_admin") {
      if (!division || !DIVISIONS.includes(division.trim())) {
        return res.status(400).json({
          success: false,
          message: "A valid division is required for a Co-Admin.",
        });
      }
    }

    // Region validation — Regional Head / Partner / City Head. These
    // roles pick a region directly (e.g. "Uttar Pradesh", "Nepal"); the
    // division it belongs to is derived automatically on the model, so
    // it's never asked for here. Must come from the fixed regions.js
    // list — no manual/free-text region is accepted.
    if (needsRegion(role)) {
      const trimmedRegion = region?.trim();
      if (!trimmedRegion || !isValidRegion(trimmedRegion)) {
        return res.status(400).json({
          success: false,
          message: "A valid region is required.",
        });
      }
    }

    // City validation — City Head. Must belong to the selected region;
    // no manual/free-text city is accepted.
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

    // Partner cities validation — each must belong to the selected region;
    // no manual/free-text city is accepted.
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

      const invalidCities = normalizedCities.filter(
        (item) => !isValidCityForRegion(item, region?.trim())
      );
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

    // Check email and phone independently instead of a single combined
    // $or query. A combined query can return the wrong document when an
    // email conflict and a phone conflict exist on two *different* users,
    // causing the wrong "already exists" message (or a false positive)
    // depending on which field happened to match on the returned doc.
    const [emailTaken, phoneTaken] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ phone: normalizedPhone }),
    ]);

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    if (phoneTaken) {
      return res.status(409).json({
        success: false,
        message: "A user with this phone already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    // Note: `division` for regional_head/partner/city_head is NOT set here
    // — it's derived automatically from `region` by the User model's
    // pre-validate hook.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,

      region: needsRegion(role) ? region.trim() : null,

      division: role === "co_admin" ? division.trim() : null,

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
      division: user.division,
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

    // Co-Admin: identical visibility to Super Admin — sees every role
    // except Super Admin (and itself is excluded from ever seeing that
    // account, per isUserInScope). No division-based filtering: a
    // Co-Admin manages the whole hierarchy, not just their own division.
    // (Co-Admin is still blocked from activating/deactivating or
    // deleting anyone — enforced in toggleUserStatus/deleteUser.)
    if (loggedInUser.role === "co_admin") {
      filter.role = {
        $in: ["co_admin", "regional_head", "partner", "city_head", "data_entry"],
      };
    }

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

    if (req.user.role === "co_admin" && user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot view the Super Admin account.",
      });
    }

    if (!isUserInScope(req.user, user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this user.",
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
      division,
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

    if (req.user.role === "co_admin" && user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "You cannot edit the Super Admin account.",
      });
    }

    if (!isUserInScope(req.user, user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this user.",
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

    // Division — Co-Admin only. Optional: only validated/applied if the
    // caller is actually trying to change it.
    if (user.role === "co_admin" && division) {
      const trimmedDivision = division.trim();
      if (!DIVISIONS.includes(trimmedDivision)) {
        return res.status(400).json({
          success: false,
          message: "Invalid division.",
        });
      }
      user.division = trimmedDivision;
    }

    // Region — Regional Head / Partner / City Head. Optional: only
    // validated/applied if the caller is actually trying to change it, so
    // updating unrelated fields (name, isActive, ...) never fails with
    // "region is required". `division` is never taken from the request
    // here — the model's pre-validate hook re-derives it from the new
    // region automatically.
    if (needsRegion(user.role) && region) {
      const trimmedRegion = region.trim();
      if (!isValidRegion(trimmedRegion)) {
        return res.status(400).json({
          success: false,
          message: "Invalid region.",
        });
      }

      // If a City Head's region changes, their existing city must still
      // be valid for the new region — otherwise we'd end up with a
      // city/region pair that fails isValidCityForRegion everywhere else.
      if (
        user.role === "city_head" &&
        user.city &&
        !isValidCityForRegion(user.city, trimmedRegion)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot change region: current city is not valid for the new region. Update the city in the same request.",
        });
      }

      user.region = trimmedRegion;
    }

    // City — City Head only. Validated against the (possibly just-updated)
    // region above.
    if (user.role === "city_head" && city) {
      const trimmedCity = city.trim();
      if (!isValidCityForRegion(trimmedCity, user.region)) {
        return res.status(400).json({
          success: false,
          message: "Please choose a valid city for the selected region.",
        });
      }
      user.city = trimmedCity;
    }

    // Cities — Partner only. Validated against the (possibly just-updated)
    // region above.
    if (user.role === "partner" && cities) {
      const normalizedCities = Array.isArray(cities)
        ? cities.map((item) => item.trim()).filter(Boolean)
        : [];

      if (normalizedCities.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Partner must have at least one city.",
        });
      }

      const invalidCities = normalizedCities.filter(
        (item) => !isValidCityForRegion(item, user.region)
      );
      if (invalidCities.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please choose valid cities for the selected region.",
        });
      }
      user.cities = normalizedCities;
    }

    // isActive — mirrors the rules enforced in toggleUserStatus. This field
    // must NOT be settable through the general update path without the same
    // checks, otherwise a Co-Admin (or anyone) could bypass toggleUserStatus's
    // restrictions simply by sending `isActive` in a PUT /users/:id body.
    if (typeof isActive === "boolean" && isActive !== user.isActive) {
      if (req.user.role === "co_admin") {
        return res.status(403).json({
          success: false,
          message:
            "Co-Admins are not permitted to activate or deactivate user accounts.",
        });
      }

      if (user.role === "super_admin") {
        return res.status(403).json({
          success: false,
          message: "Super Admin cannot be activated or deactivated.",
        });
      }

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
| Super Admin only. Co-Admins have create/edit/view access to users but
| are explicitly not permitted to activate or deactivate accounts.
*/

export const toggleUserStatus = async (req, res) => {

  try {

    if (req.user.role === "co_admin") {
      return res.status(403).json({
        success: false,
        message: "Co-Admins are not permitted to activate or deactivate user accounts.",
      });
    }

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

    if (!isUserInScope(req.user, user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this user.",
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
| Super Admin only. Co-Admins have create/edit/view access to users but
| are explicitly not permitted to delete accounts.
*/

export const deleteUser = async (req, res) => {

  try {

    if (req.user.role === "co_admin") {
      return res.status(403).json({
        success: false,
        message: "Co-Admins are not permitted to delete user accounts.",
      });
    }

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

    if (!isUserInScope(req.user, user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this user.",
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

