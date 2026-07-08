import mongoose from "mongoose";

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
      enum: ["North India", "South India", "Nepal Region"],
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

    // Set when leadStatus = "Converted"
    destinationCountry: {
      type: String,
      trim: true,
      default: "",
    },

    conversionDate: {
      type: Date,
      default: null,
    },

    // Set when leadStatus = "Withdrawn" (only reachable from Converted)
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

  // Converted: require destination country, stamp conversion date
  if (this.leadStatus === "Converted") {
    if (!this.destinationCountry) {
      return next(
        new Error("destinationCountry is required when leadStatus is 'Converted'")
      );
    }
    if (!this.conversionDate) {
      this.conversionDate = new Date();
    }
  }

  // Withdrawn: only valid coming from a Converted student, require a reason
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

export default mongoose.model("Student", studentSchema);