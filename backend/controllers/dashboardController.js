import Student from "../models/Student.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    let studentFilter = {};

  if (user.role === "data_entry") {
  studentFilter.createdBy = user._id;
}
if (user.role === "regional_head") {
  studentFilter.region = user.region;
}

if (user.role === "partner") {
  studentFilter.assignedPartner = user._id;
}

if (user.role === "city_head") {
  studentFilter.assignedCityHead = user._id;
}

   const [
  totalLeads,
  coldLeads,
  warmLeads,
  hotLeads,
  partners,
  cityHeads,
  dataEntries,
  activeUsers,
  inactiveUsers,
  recentLeads,
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

   User.countDocuments({
  role: "partner",
}),

User.countDocuments({
  role: "city_head",
}),

User.countDocuments({
  role: "data_entry",
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
      "name phone studyPreference preferredCountry leadStatus createdAt"
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

     dashboard:{

totalLeads,

coldLeads,

warmLeads,

hotLeads,

partners,

cityHeads,

dataEntries,

activeUsers,

inactiveUsers,

recentLeads,

todayFollowups

}
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};