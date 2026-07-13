import mongoose from "mongoose";
import { DIVISIONS, ALL_REGIONS, getDivisionForRegion } from "../utils/regions.js";

const ROLES_WITH_REGION = ["regional_head", "partner", "city_head"];

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

    // Only set for role = "regional_head", "partner", "city_head".
    // Picked directly (e.g. "Uttar Pradesh", "Coastal Karnataka", "Nepal")
    // — see regions.js for the full list under each division.
    region: {
      type: String,
      enum: ALL_REGIONS,
      default: null,
    },

    // For "co_admin": picked directly — one of the 3 divisions.
    // For "regional_head" / "partner" / "city_head": NEVER picked
    // manually. It's auto-derived from `region` in the pre-validate hook
    // below, so whoever creates the account only ever has to choose a
    // region, not know which division it rolls up under.
    division: {
      type: String,
      enum: DIVISIONS,
      default: null,
    },

    // Only set for role = "city_head" (single city, must belong to `region`)
    city: {
      type: String,
      default: null,
      trim: true,
    },

    // Only set for role = "partner" (each must belong to `region`)
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

// ---- Auto-derive division from region ----
// Regional Head / Partner / City Head only ever submit a region; the
// division it belongs to is looked up automatically here rather than
// requiring a second manual field. This runs on every save, so it also
// acts as a safety net if a controller-level check is ever missed.
userSchema.pre("validate", function (next) {
  if (ROLES_WITH_REGION.includes(this.role)) {
    if (this.region) {
      const derived = getDivisionForRegion(this.region);
      if (!derived) {
        // Should be unreachable given the `region` enum above, but guards
        // against the enum and REGIONS_BY_DIVISION ever drifting apart.
        return next(
          new Error(
            `Region "${this.region}" is not mapped to a division in regions.js.`
          )
        );
      }
      this.division = derived;
    } else {
      this.division = null;
    }
  }
  next();
});

// ---- Enforce a single Super Admin at the model level ----
// The controller-level role hierarchy already prevents any role from
// creating a second Super Admin via the API, but this guard protects
// the invariant regardless of entry point (seed scripts, migrations,
// future endpoints, direct DB tooling that still goes through Mongoose).
userSchema.pre("save", async function (next) {
  if (this.role === "super_admin" && (this.isNew || this.isModified("role"))) {
    const existing = await this.constructor.findOne({
      role: "super_admin",
      _id: { $ne: this._id },
    });
    if (existing) {
      return next(new Error("Only one Super Admin is allowed in the system."));
    }
  }
  next();
});

userSchema.index({ role: 1 });
userSchema.index({ region: 1 });
userSchema.index({ division: 1 });
userSchema.index({ city: 1 });
userSchema.index({ role: 1, region: 1 });

export const REGIONS = ALL_REGIONS;
export { DIVISIONS };

export default mongoose.model("User", userSchema);
