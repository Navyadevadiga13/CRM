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

    interestedCountry: {
      type: String,
      default: null,
      trim: true,
    },

    region: {
      type: String,
      enum: [
        "North India",
        "South India",
        "Nepal Region",
      ],
      required: true,
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

    leadStatus: {
      type: String,
      enum: ["Cold", "Warm", "Hot", "Converted"],
      default: "Cold",
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

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

studentSchema.index({ phone: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ leadStatus: 1 });
studentSchema.index({ city: 1 });
studentSchema.index({ region: 1 });

export default mongoose.model("Student", studentSchema);