import Student from "../models/Student.js";
import User from "../models/User.js";
import { handleLeadCreated } from "../services/automation/leadCreated.js";

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
  "Withdrawn",
];

const VALID_INTAKES = [6, 12, 18, 24];

// Defines which statuses a lead can move to from its current status.
// Withdrawn is only reachable from Converted, per the lifecycle rules.
const LEAD_STATUS_TRANSITIONS = {
  Cold: ["Cold", "Warm", "Hot"],
  Warm: ["Warm", "Cold", "Hot"],
  Hot: ["Hot", "Warm", "Converted"],
  Converted: ["Converted", "Withdrawn"],
  Withdrawn: ["Withdrawn"],
};

const VALID_STUDY_PREFERENCES = ["Study in India", "Study Abroad"];

const isSafeString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

const isValidStudyPreference = (value) =>
  VALID_STUDY_PREFERENCES.includes(value);

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
      studyPreference,
      preferredCountry,
      region,
      city,
      remarks,
      followUpDate,
    } = req.body;

    // Required Fields
    if (
      !isSafeString(name) ||
      !isSafeString(email) ||
      !isSafeString(phone) ||
      !isSafeString(studyPreference) ||
      !isSafeString(city)
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory.",
      });
    }

    // Email Validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // Phone Validation
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number.",
      });
    }

    // Study Preference Validation
    if (!isValidStudyPreference(studyPreference.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid study preference.",
      });
    }

    // Region Validation
    const trimmedRegion = region?.trim();

    if (
      trimmedRegion &&
      !VALID_REGIONS.includes(trimmedRegion)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid region.",
      });
    }

    // Follow-up Date Validation
    if (
      followUpDate &&
      isNaN(new Date(followUpDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up date.",
      });
    }

    // Duplicate Check
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
        message: "Student already exists.",
      });
    }

    // Create Student
    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      studyPreference: studyPreference.trim(),
      preferredCountry: preferredCountry?.trim() || "",
      region: trimmedRegion || null,
      city: city.trim(),
      remarks: remarks?.trim() || "",
      followUpDate: followUpDate || null,
      createdBy: req.user._id,
    });
    await handleLeadCreated(student, req.user);

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student,
    });

  } catch (error) {
    console.error("createStudent error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Students
|--------------------------------------------------------------------------
*/

export const getStudents = async (req, res) => {
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

    const skip = (page - 1) * limit;

    const filter = {};

    // Filters
    if (req.query.status) {
      filter.leadStatus = req.query.status;
    }

    if (req.query.region) {
      filter.region = req.query.region;
    }

    // Role-based access
    if (req.user.role === "regional_head") {
      filter.region = req.user.region;
    }

    if (req.user.role === "partner") {
      filter.assignedPartner = req.user._id;
    }

    if (req.user.role === "city_head") {
      filter.city = req.user.city;
      filter.assignedCityHead = req.user._id;
    }

    if (req.user.role === "data_entry") {
      filter.createdBy = req.user._id;
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("assignedPartner", "name email")
        .populate("assignedCityHead", "name email")
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("getStudents error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Student By ID
|--------------------------------------------------------------------------
*/

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("assignedPartner", "name email")
      .populate("assignedCityHead", "name email")
      .populate("createdBy", "name role");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Regional Head - only own region
    if (
      req.user.role === "regional_head" &&
      student.region !== req.user.region
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // Partner - only assigned leads
    if (
      req.user.role === "partner" &&
      student.assignedPartner &&
      student.assignedPartner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // City Head - only leads for their assigned city
    if (
      req.user.role === "city_head" &&
      student.city !== req.user.city
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // Data Entry - only leads created by them
    if (
      req.user.role === "data_entry" &&
      student.createdBy &&
      student.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });

  } catch (error) {
    console.error("getStudentById error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
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
      studyPreference,
      preferredCountry,
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

    // Name
    if (name) {
      student.name = name.trim();
    }

    // Email
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email.",
        });
      }

      const existingEmail = await Student.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: student._id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      student.email = email.toLowerCase().trim();
    }

    // Phone
    if (phone) {
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }

      const existingPhone = await Student.findOne({
        phone: phone.trim(),
        _id: { $ne: student._id },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists.",
        });
      }

      student.phone = phone.trim();
    }

    // Region
    if (region) {
      if (!VALID_REGIONS.includes(region)) {
        return res.status(400).json({
          success: false,
          message: "Invalid region.",
        });
      }

      student.region = region.trim();
    }

    // City
    if (city) {
      student.city = city.trim();
    }

    // Study Preference
    if (studyPreference !== undefined) {
      if (!isValidStudyPreference(studyPreference.trim())) {
        return res.status(400).json({
          success: false,
          message: "Invalid study preference.",
        });
      }
      student.studyPreference = studyPreference.trim();
    }

    // Preferred Country
    if (preferredCountry !== undefined) {
      student.preferredCountry = preferredCountry.trim();
    }

    // Remarks
    if (remarks !== undefined) {
      student.remarks = remarks.trim();
    }

    // Follow-up Date
    if (followUpDate !== undefined) {
      if (isNaN(new Date(followUpDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid follow-up date.",
        });
      }

      student.followUpDate = followUpDate;
    }

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
    const {
      leadStatus,
      expectedIntake,
      destinationCountry,
      withdrawalReason,
    } = req.body;

    // Only City Head can update lead status
  if (
  !["super_admin", "co_admin", "city_head"].includes(req.user.role)
) {
  return res.status(403).json({
    success: false,
    message: "You are not authorized to update lead status.",
  });
}

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
if (
  req.user.role === "city_head" &&
  student.assignedCityHead?.toString() !== req.user._id.toString()
) {
  return res.status(403).json({
    success: false,
    message: "You can only update leads assigned to you.",
  });
}

    // Enforce the lead lifecycle: Cold -> Warm -> Hot -> Converted -> Withdrawn
    const allowedNextStatuses = LEAD_STATUS_TRANSITIONS[student.leadStatus] || [];
    if (!allowedNextStatuses.includes(leadStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move a lead from '${student.leadStatus}' to '${leadStatus}'.`,
      });
    }

    // Warm: capture the expected intake period so the system can
    // auto-calculate the next follow-up date (handled in the Student model).
    if (leadStatus === "Warm") {
      const intake = Number(expectedIntake);
      if (!VALID_INTAKES.includes(intake)) {
        return res.status(400).json({
          success: false,
          message: "A valid expected intake (6, 12, 18, or 24 months) is required.",
        });
      }
      student.expectedIntake = intake;
    }

    // Hot: no extra fields required, just confirms the student's plans.
    if (leadStatus === "Hot") {
      student.expectedIntake = null;
    }

    // Converted: the student has joined a group; capture the destination.
    if (leadStatus === "Converted") {
      if (!isSafeString(destinationCountry)) {
        return res.status(400).json({
          success: false,
          message: "Destination country is required to mark a lead as Converted.",
        });
      }
      student.destinationCountry = destinationCountry.trim();
      student.conversionDate = new Date();
    }

    // Withdrawn: only reachable from Converted; capture the reason.
    if (leadStatus === "Withdrawn") {
      if (!isSafeString(withdrawalReason)) {
        return res.status(400).json({
          success: false,
          message: "A withdrawal reason is required to mark a lead as Withdrawn.",
        });
      }
      student.withdrawalReason = withdrawalReason.trim();
      student.withdrawalDate = new Date();
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

    // Partner must belong to the same region
    if (partner.region !== student.region) {
      return res.status(400).json({
        success: false,
        message: "Partner does not belong to this region.",
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
if (cityHead.city !== student.city) {
  return res.status(400).json({
    success: false,
    message: "City Head does not belong to this city.",
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

    if (remarks !== undefined && typeof remarks !== "string") {
      return res.status(400).json({
        success: false,
        message: "Remarks must be a string.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    student.remarks = remarks?.trim() || "";
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

    if (!followUpDate) {
      return res.status(400).json({
        success: false,
        message: "Follow-up date is required.",
      });
    }

    if (isNaN(new Date(followUpDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up date.",
      });
    }

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

    if (
      !["super_admin", "co_admin", "regional_head"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update lead status.",
      });
    }

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
    // Only Super Admin, Co Admin and Regional Head can delete
    if (
      !["super_admin", "co_admin", "regional_head"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete leads.",
      });
    }

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

    const query = {
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
        {
          city: {
            $regex: search,
            $options: "i",
          },
        },
        {
          studyPreference: {
            $regex: search,
            $options: "i",
          },
        },
        {
          preferredCountry: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    };

    // Role-based filtering
    if (req.user.role === "regional_head") {
      query.region = req.user.region;
    }

    if (req.user.role === "partner") {
      query.assignedPartner = req.user._id;
    }

    if (req.user.role === "city_head") {
      query.assignedCityHead = req.user._id;
    }

    if (req.user.role === "data_entry") {
      query.createdBy = req.user._id;
    }

    const students = await Student.find(query)
      .populate("assignedPartner", "name")
      .populate("assignedCityHead", "name")
      .sort({ createdAt: -1 });

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
      city,
      studyPreference,
      preferredCountry,
    } = req.query;

    const query = {};

    if (leadStatus) {
      query.leadStatus = leadStatus;
    }

    if (city) {
      query.city = city;
    }

    if (studyPreference) {
      query.studyPreference = studyPreference;
    }

    if (preferredCountry) {
      query.preferredCountry = preferredCountry;
    }

    // Role-based filters
    if (req.user.role === "regional_head") {
      query.region = req.user.region;
    }

    if (req.user.role === "partner") {
      query.assignedPartner = req.user._id;
    }

    if (req.user.role === "city_head") {
      query.assignedCityHead = req.user._id;
    }

    if (req.user.role === "data_entry") {
      query.createdBy = req.user._id;
    }

    const students = await Student.find(query)
      .populate("assignedPartner", "name")
      .populate("assignedCityHead", "name")
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