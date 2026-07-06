import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// A pre-hashed dummy value used to keep bcrypt.compare timing consistent
// even when no user is found, to avoid leaking "does this email exist".
const DUMMY_HASH =
  "$2a$12$CwTycUXWue0Thq9StjUM0uJ8mHNMkdN5UqHVy5AWyRUAoGz1x1Xoa";

// Helper: ensure a value is a plain string (blocks NoSQL injection via
// objects like { "$ne": null } or { "$gt": "" } in req.body).
const isSafeString = (value) => typeof value === "string" && value.length > 0;

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Required Fields + type check (prevents NoSQL operator injection)
    if (!isSafeString(email) || !isSafeString(password)) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      // Fail loudly server-side, but don't leak config details to the client
      console.error("JWT_SECRET is not configured.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find User (include lockout fields, which are select:false by default)
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +loginAttempts +lockUntil +passwordChangedAt"
    );

    // Always run a bcrypt compare, even for unknown users, so response
    // timing doesn't reveal whether the email exists.
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // Check Active Status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment failed attempts, lock if threshold reached
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME_MS;
        user.loginAttempts = 0;
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Success: reset lockout counters
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Build a safe user object — explicit allowlist instead of relying on
    // deleting fields, so newly added sensitive fields can't leak by default.
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      region: user.region,
      cities: user.cities,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
