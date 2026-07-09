import mongoose from "mongoose";

const leadActivitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: String,
      default: "System",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "LeadActivity",
  leadActivitySchema
);