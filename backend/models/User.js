import mongoose from "mongoose";

const VALID_REGIONS = ["North India", "South India", "Nepal Region"];

// Divisions are the top-level areas a Co-Admin is scoped to.
// Kept separate from VALID_REGIONS because a Co-Admin's division
// (e.g. "International") doesn't necessarily map to a Regional
// Head's operating region.
const VALID_DIVISIONS = ["North India", "South India", "International"];

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

    // Only set for role = "co_admin". Scopes a Co-Admin to a single
    // division (e.g. "South India", "North India", "International").
    division: {
      type: String,
      enum: VALID_DIVISIONS,
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

export const REGIONS = VALID_REGIONS;
export const DIVISIONS = VALID_DIVISIONS;

export default mongoose.model("User", userSchema);
