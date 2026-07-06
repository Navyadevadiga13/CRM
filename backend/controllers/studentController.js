import Student from "../models/Student.js";
import User from "../models/User.js";

const VALID_REGIONS = [
  "North India",
  "South India",
  "Nepal Region",
];

const VALID_STATUS = [
  "Cold",
  "Warm",
  "Hot",
  "Converted",
];

const isSafeString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

/*
|--------------------------------------------------------------------------
| Create Student
|--------------------------------------------------------------------------
*/

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      interestedCountry,
      region,
      city,
      remarks,
      followUpDate,
    } = req.body;

    if (
      !isSafeString(name) ||
      !isSafeString(email) ||
      !isSafeString(phone) ||
      !isSafeString(region) ||
      !isSafeString(city)
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    if (!VALID_REGIONS.includes(region)) {
      return res.status(400).json({
        success: false,
        message: "Invalid region.",
      });
    }

    const existingStudent = await Student.findOne({
      $or: [
        {
          email: email.toLowerCase().trim(),
        },
        {
          phone: phone.trim(),
        },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message:
          "Student already exists.",
      });
    }

    const student =
      await Student.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        interestedCountry:
          interestedCountry || null,
        region,
        city: city.trim(),
        remarks: remarks || "",
        followUpDate:
          followUpDate || null,
        createdBy: req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Student created successfully.",
      student,
    });
  } catch (error) {
    console.error(
      "createStudent error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Students
|--------------------------------------------------------------------------
*/

export const getStudents =
  async (req, res) => {
    try {
      const page = Math.max(
        parseInt(req.query.page) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          parseInt(req.query.limit) || 20,
          1
        ),
        100
      );

      const skip =
        (page - 1) * limit;

      const filter = {};

      if (req.query.status) {
        filter.leadStatus =
          req.query.status;
      }

      if (req.query.region) {
        filter.region =
          req.query.region;
      }

      if (req.user.role === "partner") {
        filter.assignedPartner =
          req.user._id;
      }

      if (
        req.user.role === "city_head"
      ) {
        filter.assignedCityHead =
          req.user._id;
      }

      const [
        students,
        total,
      ] = await Promise.all([
        Student.find(filter)
          .populate(
            "assignedPartner",
            "name"
          )
          .populate(
            "assignedCityHead",
            "name"
          )
          .skip(skip)
          .limit(limit)
          .sort({
            createdAt: -1,
          }),

        Student.countDocuments(
          filter
        ),
      ]);

      res.status(200).json({
        success: true,
        students,
        total,
        page,
        totalPages: Math.ceil(
          total / limit
        ),
      });
    } catch (error) {
      console.error(
        "getStudents error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Something went wrong.",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Get Student By ID
|--------------------------------------------------------------------------
*/

export const getStudentById =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        )
          .populate(
            "assignedPartner",
            "name email"
          )
          .populate(
            "assignedCityHead",
            "name email"
          );

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      res.status(200).json({
        success: true,
        student,
      });
    } catch (error) {
      console.error(
        "getStudentById error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Something went wrong.",
      });
    }
  };

  /*
|--------------------------------------------------------------------------
| Update Student
|--------------------------------------------------------------------------
*/

export const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      interestedCountry,
      region,
      city,
      remarks,
      followUpDate,
    } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    if (name) student.name = name.trim();

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email.",
        });
      }

      student.email = email.toLowerCase().trim();
    }

    if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }

      student.phone = phone.trim();
    }

    if (region) {
      if (!VALID_REGIONS.includes(region)) {
        return res.status(400).json({
          success: false,
          message: "Invalid region.",
        });
      }

      student.region = region;
    }

    if (city) student.city = city.trim();

    if (interestedCountry !== undefined)
      student.interestedCountry = interestedCountry;

    if (remarks !== undefined)
      student.remarks = remarks;

    if (followUpDate !== undefined)
      student.followUpDate = followUpDate;

    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student,
    });
  } catch (error) {
    console.error("updateStudent error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Lead Status
|--------------------------------------------------------------------------
*/

export const updateLeadStatus = async (req, res) => {
  try {
    const { leadStatus } = req.body;

    if (!VALID_STATUS.includes(leadStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead status.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.leadStatus = leadStatus;
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Lead status updated.",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Assign Partner
|--------------------------------------------------------------------------
*/

export const assignPartner = async (req, res) => {
  try {
    const { partnerId } = req.body;

    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== "partner") {
      return res.status(400).json({
        success: false,
        message: "Invalid partner.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.assignedPartner = partner._id;
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Partner assigned successfully.",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Assign City Head
|--------------------------------------------------------------------------
*/

export const assignCityHead = async (req, res) => {
  try {
    const { cityHeadId } = req.body;

    const cityHead = await User.findById(cityHeadId);

    if (!cityHead || cityHead.role !== "city_head") {
      return res.status(400).json({
        success: false,
        message: "Invalid city head.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.assignedCityHead = cityHead._id;
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "City Head assigned successfully.",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Remarks
|--------------------------------------------------------------------------
*/

export const updateRemarks = async (req, res) => {
  try {
    const { remarks } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.remarks = remarks || "";
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Remarks updated.",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Follow-up Date
|--------------------------------------------------------------------------
*/

export const updateFollowUp = async (req, res) => {
  try {
    const { followUpDate } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.followUpDate = followUpDate;
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Follow-up date updated.",
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Activate / Deactivate Student
|--------------------------------------------------------------------------
*/

export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.isActive = !student.isActive;
    student.updatedBy = req.user._id;

    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${
        student.isActive ? "activated" : "deactivated"
      } successfully.`,
      student,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};


// Delete Lead
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("deleteStudent error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const students = await Student.find({
      $or: [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to search students.",
    });
  }
};

export const filterStudents = async (req, res) => {
  try {
    const {
      leadStatus,
      interestedCountry,
    } = req.query;

    const query = {};

    if (leadStatus) {
      query.leadStatus = leadStatus;
    }

    if (interestedCountry) {
      query.interestedCountry =
        interestedCountry;
    }

    const students = await Student.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to filter students.",
    });

  }
};