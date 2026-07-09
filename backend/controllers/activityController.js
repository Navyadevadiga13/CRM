import LeadActivity from "../models/LeadActivity.js";

export const getLeadActivities = async (req, res) => {
  try {
    const activities = await LeadActivity.find({
      student: req.params.studentId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch activities",
    });
  }
};