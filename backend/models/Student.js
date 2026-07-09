import mongoose from "mongoose";
import { ALL_REGIONS } from "../utils/regions.js";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid phone number"],
    },

    studyPreference: {
      type: String,
      required: true,
      trim: true,
    },

    preferredCountry: {
      type: String,
      default: "",
      trim: true,
    },

    region: {
      type: String,
      enum: ALL_REGIONS,
      default: null,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    assignedPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedCityHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ---- Lead lifecycle ----
    // Any status can move to any other status directly (Cold -> Converted,
    // Cold -> Withdrawn, etc.) — the only gate is each status's own
    // mandatory fields, validated below. There is no forced staircase.
    leadStatus: {
      type: String,
      enum: ["Cold", "Warm", "Hot", "Converted", "Withdrawn"],
      default: "Cold",
    },

    // Set when leadStatus = "Warm": how many months out the student
    // expects to start studying. Drives the auto-calculated followUpDate.
    expectedIntake: {
      type: Number,
      enum: [6, 12, 18, 24],
      default: null,
    },

    // ---- Set when leadStatus = "Converted" ----
    destinationCountry: {
      type: String,
      trim: true,
      default: "",
    },

    // Admission intake month (1-12) and year — distinct fields so
    // reporting/reminders can query them directly instead of parsing
    // conversionDate (which just records *when the record was marked
    // Converted*, not the intake month/year the student is admitted for).
    intakeMonth: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },

    intakeYear: {
      type: Number,
      min: 2000,
      max: 2100,
      default: null,
    },

    conversionDate: {
      type: Date,
      default: null,
    },

    // Set when leadStatus = "Withdrawn"
    withdrawalReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    withdrawalDate: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Auto-set from expectedIntake when status becomes "Warm";
    // can still be overridden manually by staff if needed.
    followUpDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// ---- Lifecycle validation & automation ----
// Only validates the mandatory fields for whichever status is being set —
// no requirement that the lead passed through any particular prior status.
studentSchema.pre("validate", function (next) {
  // Warm: require an intake period and auto-calc the follow-up date
  if (this.leadStatus === "Warm") {
    if (!this.expectedIntake) {
      return next(
        new Error("expectedIntake is required when leadStatus is 'Warm'")
      );
    }
    const base = new Date();
    base.setMonth(base.getMonth() + this.expectedIntake);
    this.followUpDate = base;
  }

  // Converted: require destination country + intake month/year, stamp conversion date
  if (this.leadStatus === "Converted") {
    if (!this.destinationCountry) {
      return next(
        new Error("destinationCountry is required when leadStatus is 'Converted'")
      );
    }
    if (!this.intakeMonth || !this.intakeYear) {
      return next(
        new Error("intakeMonth and intakeYear are required when leadStatus is 'Converted'")
      );
    }
    if (!this.conversionDate) {
      this.conversionDate = new Date();
    }
  }

  // Withdrawn: require a reason and stamp the withdrawal date. Reachable
  // directly from any status, not just Converted.
  if (this.leadStatus === "Withdrawn") {
    if (!this.withdrawalReason) {
      return next(
        new Error("withdrawalReason is required when leadStatus is 'Withdrawn'")
      );
    }
    if (!this.withdrawalDate) {
      this.withdrawalDate = new Date();
    }
  }

  next();
});

studentSchema.index({ phone: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ city: 1 });
studentSchema.index({ region: 1 });
studentSchema.index({ leadStatus: 1 });
studentSchema.index({ leadStatus: 1, city: 1 });
studentSchema.index({ followUpDate: 1 });
studentSchema.index({ createdBy: 1 });

export default mongoose.model("Student", studentSchema);
