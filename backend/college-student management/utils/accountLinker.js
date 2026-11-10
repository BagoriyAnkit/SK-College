const mongoose = require("mongoose");
const Student = require("../model/admin/student");
const Faculty = require("../model/admin/faculty");
const AdminUser = require("../model/admin/user");
const User = require("../model/fronted/register");

/**
 * Validates whether an input is a valid MongoDB ObjectId.
 */
const isValidObjectId = (id) => {
  return Boolean(id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id));
};

/**
 * Normalizes phone numbers to digits only for reliable comparison.
 */
const normalizePhone = (phone) => {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "").slice(-10);
};

/**
 * Normalizes email address for consistent comparison.
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.toLowerCase().trim();
};

/**
 * Safely links a Student profile record to a frontend User authentication account.
 * Enforces role verification, bidirectional 1-to-1 uniqueness, and rollback on failure.
 */
const linkStudentToUser = async ({ studentId, userId }) => {
  if (!studentId || !userId) {
    return {
      success: false,
      statusCode: 400,
      message: "Both studentId and userId are required",
    };
  }

  if (!isValidObjectId(studentId) || !isValidObjectId(userId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid ID format for studentId or userId",
    };
  }

  const studentRecord = await Student.findById(studentId);
  if (!studentRecord) {
    return {
      success: false,
      statusCode: 404,
      message: "Student record not found",
    };
  }

  const userAccount = await User.findById(userId);
  if (!userAccount) {
    return {
      success: false,
      statusCode: 404,
      message: "User authentication account not found",
    };
  }

  // Verify role compatibility
  const userRole = String(userAccount.role || "student").toLowerCase().trim();
  if (userRole !== "student" && userRole !== "user") {
    return {
      success: false,
      statusCode: 400,
      message: `User account has role '${userRole}', cannot link to a student record`,
    };
  }

  // Check 1: Document-level duplicate link checks
  if (studentRecord.userId && studentRecord.userId.toString() !== userAccount._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This student profile is already linked to another user account",
    };
  }

  if (userAccount.studentId && userAccount.studentId.toString() !== studentRecord._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This user account is already linked to another student record",
    };
  }

  // Check 2: Reverse database lookup to guarantee strict 1-to-1 uniqueness
  const existingStudentForUser = await Student.findOne({ userId: userAccount._id });
  if (existingStudentForUser && existingStudentForUser._id.toString() !== studentRecord._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This user account is already linked to another student profile in the database",
    };
  }

  const existingUserForStudent = await User.findOne({ studentId: studentRecord._id });
  if (existingUserForStudent && existingUserForStudent._id.toString() !== userAccount._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This student profile is already linked to another user account in the database",
    };
  }

  // Two-phase save with rollback to ensure atomicity
  const prevStudentUserId = studentRecord.userId;
  const prevUserStudentId = userAccount.studentId;

  studentRecord.userId = userAccount._id;
  await studentRecord.save();

  try {
    userAccount.studentId = studentRecord._id;
    await userAccount.save();
  } catch (secondErr) {
    // Roll back the first document update
    studentRecord.userId = prevStudentUserId;
    await studentRecord.save().catch((rbErr) => {
      console.error("Rollback failed for studentRecord:", rbErr);
    });
    return {
      success: false,
      statusCode: 500,
      message: "Failed to link user account. Student profile update was rolled back.",
      error: secondErr.message,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Student record successfully linked to authentication account",
    data: {
      studentId: studentRecord._id,
      studentName: studentRecord.StudentName,
      userId: userAccount._id,
      email: userAccount.email,
    },
  };
};

/**
 * Unlinks a Student profile from its User authentication account.
 * Restores previous state if either operation fails.
 */
const unlinkStudent = async (studentId) => {
  if (!studentId || !isValidObjectId(studentId)) {
    return { success: false, statusCode: 400, message: "Valid studentId is required" };
  }

  const studentRecord = await Student.findById(studentId);
  if (!studentRecord) {
    return { success: false, statusCode: 404, message: "Student record not found" };
  }

  if (studentRecord.userId) {
    const userAccount = await User.findById(studentRecord.userId);
    const prevStudentUserId = studentRecord.userId;
    const prevUserStudentId = userAccount?.studentId;

    if (userAccount && userAccount.studentId?.toString() === studentRecord._id.toString()) {
      userAccount.studentId = null;
      await userAccount.save();
    }

    try {
      studentRecord.userId = null;
      await studentRecord.save();
    } catch (secondErr) {
      if (userAccount) {
        userAccount.studentId = prevUserStudentId;
        await userAccount.save().catch((rbErr) => {
          console.error("Rollback failed for userAccount:", rbErr);
        });
      }
      return {
        success: false,
        statusCode: 500,
        message: "Failed to unlink student record. Account changes were rolled back.",
        error: secondErr.message,
      };
    }
  }

  return { success: true, statusCode: 200, message: "Student account unlinked successfully" };
};

/**
 * Safely links a Faculty profile record to an AdminUser (Teacher/HOD) authentication account.
 * Enforces role verification, bidirectional 1-to-1 uniqueness, and rollback on failure.
 */
const linkFacultyToAdminUser = async ({ facultyId, userId }) => {
  if (!facultyId || !userId) {
    return {
      success: false,
      statusCode: 400,
      message: "Both facultyId and userId are required",
    };
  }

  if (!isValidObjectId(facultyId) || !isValidObjectId(userId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid ID format for facultyId or userId",
    };
  }

  const facultyRecord = await Faculty.findById(facultyId);
  if (!facultyRecord) {
    return {
      success: false,
      statusCode: 404,
      message: "Faculty record not found",
    };
  }

  const adminAccount = await AdminUser.findById(userId);
  if (!adminAccount) {
    return {
      success: false,
      statusCode: 404,
      message: "Staff authentication account not found",
    };
  }

  // Verify role compatibility: must be teacher or hod
  const adminRole = String(adminAccount.role || "").toLowerCase().trim();
  if (adminRole !== "teacher" && adminRole !== "hod") {
    return {
      success: false,
      statusCode: 400,
      message: `Account role is '${adminRole}'. Only 'teacher' or 'hod' roles can be linked to faculty profiles`,
    };
  }

  // Check 1: Document-level duplicate link checks
  if (facultyRecord.userId && facultyRecord.userId.toString() !== adminAccount._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This faculty record is already linked to another staff account",
    };
  }

  if (adminAccount.facultyId && adminAccount.facultyId.toString() !== facultyRecord._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This staff account is already linked to another faculty record",
    };
  }

  // Check 2: Reverse database lookup to guarantee strict 1-to-1 uniqueness
  const existingFacultyForAdmin = await Faculty.findOne({ userId: adminAccount._id });
  if (existingFacultyForAdmin && existingFacultyForAdmin._id.toString() !== facultyRecord._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This staff account is already linked to another faculty profile in the database",
    };
  }

  const existingAdminForFaculty = await AdminUser.findOne({ facultyId: facultyRecord._id });
  if (existingAdminForFaculty && existingAdminForFaculty._id.toString() !== adminAccount._id.toString()) {
    return {
      success: false,
      statusCode: 409,
      message: "This faculty record is already linked to another staff account in the database",
    };
  }

  // Two-phase save with rollback to ensure atomicity
  const prevFacultyUserId = facultyRecord.userId;
  const prevAdminFacultyId = adminAccount.facultyId;

  facultyRecord.userId = adminAccount._id;
  await facultyRecord.save();

  try {
    adminAccount.facultyId = facultyRecord._id;
    await adminAccount.save();
  } catch (secondErr) {
    facultyRecord.userId = prevFacultyUserId;
    await facultyRecord.save().catch((rbErr) => {
      console.error("Rollback failed for facultyRecord:", rbErr);
    });
    return {
      success: false,
      statusCode: 500,
      message: "Failed to link staff account. Faculty profile update was rolled back.",
      error: secondErr.message,
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: "Faculty record successfully linked to teacher authentication account",
    data: {
      facultyId: facultyRecord._id,
      teacherName: facultyRecord.TeacherName,
      userId: adminAccount._id,
      email: adminAccount.email,
      role: adminAccount.role,
    },
  };
};

/**
 * Unlinks a Faculty profile from its AdminUser account.
 * Restores previous state if either operation fails.
 */
const unlinkFaculty = async (facultyId) => {
  if (!facultyId || !isValidObjectId(facultyId)) {
    return { success: false, statusCode: 400, message: "Valid facultyId is required" };
  }

  const facultyRecord = await Faculty.findById(facultyId);
  if (!facultyRecord) {
    return { success: false, statusCode: 404, message: "Faculty record not found" };
  }

  if (facultyRecord.userId) {
    const adminAccount = await AdminUser.findById(facultyRecord.userId);
    const prevFacultyUserId = facultyRecord.userId;
    const prevAdminFacultyId = adminAccount?.facultyId;

    if (adminAccount && adminAccount.facultyId?.toString() === facultyRecord._id.toString()) {
      adminAccount.facultyId = null;
      await adminAccount.save();
    }

    try {
      facultyRecord.userId = null;
      await facultyRecord.save();
    } catch (secondErr) {
      if (adminAccount) {
        adminAccount.facultyId = prevAdminFacultyId;
        await adminAccount.save().catch((rbErr) => {
          console.error("Rollback failed for adminAccount:", rbErr);
        });
      }
      return {
        success: false,
        statusCode: 500,
        message: "Failed to unlink faculty record. Staff account state was rolled back.",
        error: secondErr.message,
      };
    }
  }

  return { success: true, statusCode: 200, message: "Faculty account unlinked successfully" };
};

/**
 * Runs an audit of all existing student and faculty records against auth accounts.
 * Only links accounts when BOTH email AND phone number match exactly and role matches.
 * Ambiguous or single-attribute partial matches are flagged and NOT linked automatically.
 */
const auditAndLinkAccounts = async () => {
  const summary = {
    students: {
      total: 0,
      linked: [],
      unmatched: [],
      ambiguous: [],
    },
    faculties: {
      total: 0,
      linked: [],
      unmatched: [],
      ambiguous: [],
    },
    authUsers: {
      studentUsersTotal: 0,
      unmatchedStudentUsers: [],
      staffUsersTotal: 0,
      unmatchedStaffUsers: [],
    },
  };

  // 1. Audit Students
  const allStudents = await Student.find();
  const allStudentUsers = await User.find();
  summary.students.total = allStudents.length;
  summary.authUsers.studentUsersTotal = allStudentUsers.length;

  for (const st of allStudents) {
    const stEmail = normalizeEmail(st.email);
    const stPhone = normalizePhone(st.Phonenumber);

    if (st.userId) {
      const existingUser = await User.findById(st.userId);
      summary.students.linked.push({
        studentId: st._id,
        studentName: st.StudentName,
        email: st.email,
        userId: st.userId,
        linkedUserEmail: existingUser?.email || "unknown",
        reason: "Already linked",
      });
      continue;
    }

    if (!stEmail) {
      summary.students.unmatched.push({
        studentId: st._id,
        studentName: st.StudentName,
        reason: "Missing email in student record",
      });
      continue;
    }

    const emailMatches = allStudentUsers.filter(
      (u) => normalizeEmail(u.email) === stEmail
    );

    if (emailMatches.length === 0) {
      summary.students.unmatched.push({
        studentId: st._id,
        studentName: st.StudentName,
        email: st.email,
        phone: st.Phonenumber,
        reason: "No authentication account found with matching email",
      });
    } else if (emailMatches.length === 1) {
      const matchUser = emailMatches[0];
      const matchPhone = normalizePhone(matchUser.mobile_no);

      // Verify reliable multi-attribute match
      if (stPhone && matchPhone && stPhone === matchPhone) {
        // Safe to link
        await linkStudentToUser({ studentId: st._id, userId: matchUser._id });
        summary.students.linked.push({
          studentId: st._id,
          studentName: st.StudentName,
          userId: matchUser._id,
          email: st.email,
          reason: "Reliably matched on verified email and phone number",
        });
      } else {
        // Ambiguous: email matches but phone is different or missing
        summary.students.ambiguous.push({
          studentId: st._id,
          studentName: st.StudentName,
          studentEmail: st.email,
          studentPhone: st.Phonenumber,
          userAuthId: matchUser._id,
          userAuthEmail: matchUser.email,
          userAuthPhone: matchUser.mobile_no,
          reason:
            "Email matches but phone numbers differ or are incomplete. Requires manual review.",
        });
      }
    } else {
      // Multiple user accounts with the same email
      summary.students.ambiguous.push({
        studentId: st._id,
        studentName: st.StudentName,
        email: st.email,
        reason: "Multiple user accounts found with identical email. Auto-linking skipped.",
      });
    }
  }

  // Find student auth accounts not linked to any student profile
  const linkedStudentUserIds = (await Student.find({ userId: { $ne: null } })).map((s) =>
    s.userId.toString()
  );
  for (const u of allStudentUsers) {
    if (!linkedStudentUserIds.includes(u._id.toString())) {
      summary.authUsers.unmatchedStudentUsers.push({
        userId: u._id,
        email: u.email,
        name: u.full_name,
        phone: u.mobile_no,
        course: u.course,
      });
    }
  }

  // 2. Audit Faculty
  const allFaculties = await Faculty.find();
  const allAdminUsers = await AdminUser.find();
  summary.faculties.total = allFaculties.length;
  summary.authUsers.staffUsersTotal = allAdminUsers.length;

  for (const fac of allFaculties) {
    const facEmail = normalizeEmail(fac.Email);
    const facPhone = normalizePhone(fac.PhoneNumber);

    if (fac.userId) {
      const existingAdmin = await AdminUser.findById(fac.userId);
      summary.faculties.linked.push({
        facultyId: fac._id,
        teacherName: fac.TeacherName,
        email: fac.Email,
        userId: fac.userId,
        linkedUserEmail: existingAdmin?.email || "unknown",
        reason: "Already linked",
      });
      continue;
    }

    if (!facEmail) {
      summary.faculties.unmatched.push({
        facultyId: fac._id,
        teacherName: fac.TeacherName,
        reason: "Missing email in faculty record",
      });
      continue;
    }

    const staffMatches = allAdminUsers.filter(
      (u) =>
        normalizeEmail(u.email) === facEmail &&
        (u.role === "teacher" || u.role === "hod")
    );

    if (staffMatches.length === 0) {
      summary.faculties.unmatched.push({
        facultyId: fac._id,
        teacherName: fac.TeacherName,
        email: fac.Email,
        phone: fac.PhoneNumber,
        reason: "No teacher/HOD staff authentication account found with matching email",
      });
    } else if (staffMatches.length === 1) {
      const matchStaff = staffMatches[0];
      const matchPhone = normalizePhone(matchStaff.phone);

      if (facPhone && matchPhone && facPhone === matchPhone) {
        await linkFacultyToAdminUser({ facultyId: fac._id, userId: matchStaff._id });
        summary.faculties.linked.push({
          facultyId: fac._id,
          teacherName: fac.TeacherName,
          userId: matchStaff._id,
          email: fac.Email,
          reason: "Reliably matched on verified email and phone number",
        });
      } else {
        summary.faculties.ambiguous.push({
          facultyId: fac._id,
          teacherName: fac.TeacherName,
          facultyEmail: fac.Email,
          facultyPhone: fac.PhoneNumber,
          staffAuthId: matchStaff._id,
          staffEmail: matchStaff.email,
          staffPhone: matchStaff.phone,
          reason: "Email matches but phone numbers differ. Manual review required.",
        });
      }
    } else {
      summary.faculties.ambiguous.push({
        facultyId: fac._id,
        teacherName: fac.TeacherName,
        email: fac.Email,
        reason: "Multiple staff accounts match this email. Auto-linking skipped.",
      });
    }
  }

  // Find teacher/hod auth accounts not linked to any faculty record
  const linkedFacultyUserIds = (await Faculty.find({ userId: { $ne: null } })).map((f) =>
    f.userId.toString()
  );
  for (const adm of allAdminUsers) {
    if (
      (adm.role === "teacher" || adm.role === "hod") &&
      !linkedFacultyUserIds.includes(adm._id.toString())
    ) {
      summary.authUsers.unmatchedStaffUsers.push({
        userId: adm._id,
        email: adm.email,
        name: adm.name,
        role: adm.role,
      });
    }
  }

  return summary;
};

module.exports = {
  normalizeEmail,
  normalizePhone,
  linkStudentToUser,
  unlinkStudent,
  linkFacultyToAdminUser,
  unlinkFaculty,
  auditAndLinkAccounts,
};
