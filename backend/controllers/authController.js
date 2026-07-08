import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


// Helper: ensure a value is a plain string (blocks NoSQL injection via
// objects like { "$ne": null } or { "$gt": "" } in req.body).
const isSafeString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

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

  const user = await User.findOne({
  email: normalizedEmail,
}).select("+password");

if (!user) {
  return res.status(401).json({
    success: false,
    message: "Invalid email or password.",
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
     

      return res.status(401).json({
        success: false,
      message: "Invalid email or password.",
      });
    }
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
  city: user.city,
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
