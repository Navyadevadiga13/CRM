import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| Role hierarchy (for reference — enforced in controllers)
|--------------------------------------------------------------------------
| super_admin  -> full access to everything
| co_admin     -> full access to everything
| regional_head-> tied to ONE region, can create/view "partner" + "city_head"
|                 that belong to that region
| partner      -> tied to MANY cities, can create/view "city_head"
|                 that belong to their own cities
| city_head    -> tied to ONE city, can only update lead status
| data_entry   -> no management rights, only creates leads
|--------------------------------------------------------------------------
*/

const VALID_REGIONS = ["North India", "South India", "Nepal Region"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: [
        "super_admin",
        "co_admin",
        "regional_head",
        "partner",
        "city_head",
        "data_entry",
      ],
      required: true,
    },

    // Only set for role = "regional_head", "partner" (auto), "city_head" (auto)
    region: {
      type: String,
      enum: VALID_REGIONS,
      default: null,
    },

    // Only set for role = "city_head" (single city)
    city: {
      type: String,
      default: null,
      trim: true,
    },

    // Only set for role = "partner" (a partner can own many cities)
    cities: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ---- Security / brute-force protection fields (kept out of normal queries) ----
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Number,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ role: 1 });
userSchema.index({ region: 1 });
userSchema.index({ city: 1 });

export const REGIONS = VALID_REGIONS;

export default mongoose.model("User", userSchema);
