const mongoose = require("mongoose");
const student = require("../../model/admin/student");
const User = require("../../model/fronted/register");
const Batch = require("../../model/admin/batch");
const Department = require("../../model/admin/department");
const { linkStudentToUser, unlinkStudent } = require("../../utils/accountLinker");

/**
 * Helper to resolve batch ID if passed as ObjectId or Batch name.
 */
const resolveBatchId = async (batchInput) => {
  if (!batchInput) return null;
  if (mongoose.Types.ObjectId.isValid(batchInput)) {
    return new mongoose.Types.ObjectId(batchInput);
  }
  const found = await Batch.findOne({ batchName: String(batchInput).trim() });
  return found ? found._id : null;
};

/**
 * Helper to resolve department ID if passed as ObjectId or Department name.
 */
const resolveDepartmentId = async (deptInput) => {
  if (!deptInput) return null;
  if (mongoose.Types.ObjectId.isValid(deptInput)) {
    return new mongoose.Types.ObjectId(deptInput);
  }
  const found = await Department.findOne({
    DepartmentName: new RegExp(`^${String(deptInput).trim()}$`, "i")
  });
  return found ? found._id : null;
};

const addStudent = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : "";
    const existingstudent = await student.findOne({ email: cleanEmail });
    if (existingstudent) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "A student with this email already exists"
      });
    }

    const photo = req?.file?.filename;

    const batchId = await resolveBatchId(req.body.batch || req.body.batchId);
    const departmentId = await resolveDepartmentId(req.body.department || req.body.departmentId);

    const studentData = await student.create({
      ...req.body,
      email: cleanEmail,
      image: photo,
      rollNumber: req.body.rollNumber || req.body.RollNumber || "",
      semester: Number(req.body.semester || req.body.Semester || 1),
      batch: batchId,
      department: departmentId,
      parentName: req.body.parentName || req.body.ParentName || req.body.guardianName || "",
      parentContact: req.body.parentContact || req.body.ParentContact || req.body.guardianPhone || "",
      status: req.body.status || "Active"
    });

    // Ensure reciprocal User login account exists for portal authentication
    let userAccount = await User.findOne({ email: cleanEmail });
    if (!userAccount) {
      userAccount = await User.create({
        full_name: studentData.StudentName,
        email: cleanEmail,
        mobile_no: studentData.Phonenumber,
        course: studentData.Course,
        role: "student",
        status: studentData.status || "Active",
        password: null,
        studentId: studentData._id
      });
    }

    studentData.userId = userAccount._id;
    await studentData.save();

    if (userAccount.studentId?.toString() !== studentData._id.toString()) {
      userAccount.studentId = studentData._id;
      await userAccount.save();
    }

    await studentData.populate([
      { path: "batch", select: "batchName session strength courseName" },
      { path: "department", select: "DepartmentName DepartmentCode HOD" }
    ]);

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Student added successfully and login account provisioned",
      data: studentData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to add student"
    });
  }
};

const findStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = await student
      .findById(id)
      .populate("batch", "batchName session strength courseName")
      .populate("department", "DepartmentName DepartmentCode HOD")
      .populate("userId", "full_name email role status");

    if (!studentData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Student not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "found student successfully",
      data: studentData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error finding student"
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }

    if (updateData.batch !== undefined || updateData.batchId !== undefined) {
      updateData.batch = await resolveBatchId(updateData.batch || updateData.batchId);
    }

    if (updateData.department !== undefined || updateData.departmentId !== undefined) {
      updateData.department = await resolveDepartmentId(updateData.department || updateData.departmentId);
    }

    if (updateData.RollNumber && !updateData.rollNumber) {
      updateData.rollNumber = updateData.RollNumber;
    }
    if (updateData.Semester && !updateData.semester) {
      updateData.semester = updateData.Semester;
    }
    if (updateData.ParentName && !updateData.parentName) {
      updateData.parentName = updateData.ParentName;
    }
    if (updateData.ParentContact && !updateData.parentContact) {
      updateData.parentContact = updateData.ParentContact;
    }

    const studentData = await student
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("batch", "batchName session strength courseName")
      .populate("department", "DepartmentName DepartmentCode HOD");

    if (!studentData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Student not found"
      });
    }

    // Keep linked User account in sync
    if (studentData.userId) {
      const userUpdate = {};
      if (updateData.StudentName) userUpdate.full_name = updateData.StudentName;
      if (updateData.Phonenumber) userUpdate.mobile_no = updateData.Phonenumber;
      if (updateData.Course) userUpdate.course = updateData.Course;
      if (updateData.status) userUpdate.status = updateData.status;
      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(studentData.userId, userUpdate).catch(() => {});
      }
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "student updated successfully",
      data: studentData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating student"
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentData = await student.findByIdAndDelete(id);
    if (!studentData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Student not found"
      });
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "student deleted successfully",
      data: studentData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error deleting student"
    });
  }
};

const viewAllStudent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalStudents = await student.countDocuments();

    const studentData = await student
      .find()
      .populate("batch", "batchName session strength courseName")
      .populate("department", "DepartmentName DepartmentCode HOD")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Student found successfully",
      data: studentData,
      currentPage: page,
      totalPages: Math.ceil(totalStudents / limit),
      totalStudents,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < Math.ceil(totalStudents / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Error",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const studentRes = await student.findById(id);

    if (!studentRes) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    studentRes.status = studentRes.status === "Active" ? "Inactive" : "Active";
    await studentRes.save();

    // Keep linked authentication user account status in sync
    if (studentRes.userId) {
      await User.findByIdAndUpdate(studentRes.userId, { status: studentRes.status }).catch(() => {});
    }

    return res.status(200).json({
      status: true,
      message: "Status updated successfully",
      data: studentRes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const linkAccount = async (req, res) => {
  try {
    const { studentId, userId } = req.body;
    const result = await linkStudentToUser({ studentId, userId });
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const unlinkAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await unlinkStudent(id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const st = await student.findById(id).populate("userId", "full_name email mobile_no role");
    if (!st) {
      return res.status(404).json({ status: false, message: "Student not found" });
    }
    return res.status(200).json({
      status: true,
      isLinked: Boolean(st.userId),
      student: {
        id: st._id,
        name: st.StudentName,
        email: st.email
      },
      linkedAccount: st.userId || null
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  addStudent,
  findStudent,
  updateStudent,
  deleteStudent,
  viewAllStudent,
  updateStatus,
  linkAccount,
  unlinkAccount,
  getLinkStatus
};
