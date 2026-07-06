import Student from "../models/Student.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    let studentFilter = {};

    // Role Based Dashboard
    if (user.role === "partner") {
      studentFilter.assignedPartner = user._id;
    }

    if (user.role === "city_head") {
      studentFilter.assignedCityHead = user._id;
    }

    const [
      totalStudents,
      coldLeads,
      warmLeads,
      hotLeads,
      convertedLeads,
      activeUsers,
      inactiveUsers,
      recentStudents,
      todayFollowups,
    ] = await Promise.all([

      Student.countDocuments(studentFilter),

      Student.countDocuments({
        ...studentFilter,
        leadStatus: "Cold",
      }),

      Student.countDocuments({
        ...studentFilter,
        leadStatus: "Warm",
      }),

      Student.countDocuments({
        ...studentFilter,
        leadStatus: "Hot",
      }),

      Student.countDocuments({
        ...studentFilter,
        leadStatus: "Converted",
      }),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: false,
      }),

      Student.find(studentFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "name phone interestedCountry leadStatus createdAt"
        ),

      Student.find({
        ...studentFilter,
        followUpDate: {
          $gte: new Date(
            new Date().setHours(0, 0, 0, 0)
          ),
          $lte: new Date(
            new Date().setHours(23, 59, 59, 999)
          ),
        },
      })
        .select(
          "name phone followUpDate leadStatus"
        )
        .sort({
          followUpDate: 1,
        }),
    ]);

    res.status(200).json({
      success: true,

      dashboard: {
        totalStudents,
        coldLeads,
        warmLeads,
        hotLeads,
        convertedLeads,

        activeUsers,
        inactiveUsers,

        recentStudents,

        todayFollowups,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};