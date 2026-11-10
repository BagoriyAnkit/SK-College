const mongoose = require("mongoose");
const Batch = require("../../model/admin/batch");
const Course = require("../../model/admin/course");
const Faculty = require("../../model/admin/faculty");
const Student = require("../../model/admin/student");

// Helper to resolve and verify existing course
const resolveCourse = async (input) => {
  if (!input) return { courseId: null, courseName: "" };

  if (typeof input === "object" && input !== null) {
    if (input._id) {
      return { courseId: input._id, courseName: input.courseName || "" };
    }
  }

  const inputStr = String(input).trim();
  // If it's a valid MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(inputStr) && String(new mongoose.Types.ObjectId(inputStr)) === inputStr) {
    const foundCourse = await Course.findById(inputStr);
    if (foundCourse) {
      return { courseId: foundCourse._id, courseName: foundCourse.courseName };
    }
    return { notFound: true, attempted: inputStr };
  }

  // Try finding by exact or case-insensitive courseName
  const foundByName = await Course.findOne({
    courseName: { $regex: new RegExp("^" + inputStr + "$", "i") }
  });
  if (foundByName) {
    return { courseId: foundByName._id, courseName: foundByName.courseName };
  }

  // Try finding by courseCode
  const foundByCode = await Course.findOne({
    courseCode: { $regex: new RegExp("^" + inputStr + "$", "i") }
  });
  if (foundByCode) {
    return { courseId: foundByCode._id, courseName: foundByCode.courseName };
  }

  return { notFound: true, attempted: inputStr };
};

// Helper to resolve faculty reference for classTeacher
const resolveClassTeacher = async (input) => {
  if (!input) return null;
  const inputStr = String(input).trim();
  if (mongoose.Types.ObjectId.isValid(inputStr) && String(new mongoose.Types.ObjectId(inputStr)) === inputStr) {
    const fac = await Faculty.findById(inputStr);
    if (fac) return fac._id;
  }
  const facByName = await Faculty.findOne({
    TeacherName: { $regex: new RegExp("^" + inputStr + "$", "i") }
  });
  if (facByName) return facByName._id;
  return null;
};

const viewAll = async (req, res) => {
  try {
    const batchData = await Batch.find()
      .populate("course", "courseName courseCode duration totalSemester department status")
      .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "batch found successfully",
      data: batchData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "error",
      error: error.message
    });
  }
};

const addBatch = async (req, res) => {
  try {
    const { batchName } = req.body;
    if (!batchName) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Batch Name is required"
      });
    }

    const existingBatch = await Batch.findOne({
      batchName: { $regex: new RegExp("^" + batchName.trim() + "$", "i") }
    });
    if (existingBatch) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: "Batch already exists"
      });
    }

    // Resolve and verify Course (prevents assigning to a non-existing course)
    const courseInput = req.body.course || req.body.courseId || req.body.courseName;
    if (!courseInput) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Course is required"
      });
    }

    const resolvedCourse = await resolveCourse(courseInput);
    if (resolvedCourse.notFound) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: `Course "${courseInput}" does not exist. Please select a valid existing course.`
      });
    }

    const teacherId = await resolveClassTeacher(req.body.classTeacher);

    const payload = {
      ...req.body,
      batchName: batchName.trim(),
      course: resolvedCourse.courseId,
      courseName: resolvedCourse.courseName,
      classTeacher: teacherId
    };

    const createdDoc = await Batch.create(payload);
    const populatedData = await Batch.findById(createdDoc._id)
      .populate("course", "courseName courseCode duration totalSemester department status")
      .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status");

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "batch added successfully",
      data: populatedData || createdDoc
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "error",
      error: error.message
    });
  }
};

const findBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batchData = await Batch.findById(id)
      .populate("course", "courseName courseCode duration totalSemester department status")
      .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status");

    if (!batchData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Batch not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "batch found successfully",
      data: batchData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "error",
      error: error.message
    });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const courseInput = updateData.course !== undefined ? updateData.course : (updateData.courseId !== undefined ? updateData.courseId : updateData.courseName);
    if (courseInput !== undefined && courseInput !== "") {
      const resolvedCourse = await resolveCourse(courseInput);
      if (resolvedCourse.notFound) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Course "${courseInput}" does not exist. Please select a valid existing course.`
        });
      }
      updateData.course = resolvedCourse.courseId;
      updateData.courseName = resolvedCourse.courseName;
    }

    if (updateData.classTeacher !== undefined && updateData.classTeacher !== "") {
      const teacherId = await resolveClassTeacher(updateData.classTeacher);
      updateData.classTeacher = teacherId;
    }

    const batchData = await Batch.findByIdAndUpdate(id, updateData, { new: true })
      .populate("course", "courseName courseCode duration totalSemester department status")
      .populate("classTeacher", "TeacherName Email PhoneNumber Department Qualification Experience status");

    if (!batchData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Batch not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "updated batch successfully",
      data: batchData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "error",
      error: error.message
    });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // Referential integrity check: check if any students are enrolled in this batch
    const enrolledStudents = await Student.countDocuments({ batch: id });
    if (enrolledStudents > 0) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: `Cannot delete batch. There are ${enrolledStudents} student(s) currently assigned to this batch. Please reassign them first.`
      });
    }

    const batchData = await Batch.findByIdAndDelete(id);

    if (!batchData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Batch not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "batch deleted successfully",
      data: batchData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "error",
      error: error.message
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const batchData = await Batch.findById(id);

    if (!batchData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Batch not found"
      });
    }

    // Toggle boolean status (true <-> false)
    batchData.status = !batchData.status;
    await batchData.save();

    await batchData.populate([
      { path: "course", select: "courseName courseCode duration totalSemester department status" },
      { path: "classTeacher", select: "TeacherName Email PhoneNumber Department Qualification Experience status" }
    ]);

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Batch status updated successfully",
      data: batchData
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Error updating status",
      error: error.message
    });
  }
};

module.exports = {
  addBatch,
  findBatch,
  updateBatch,
  deleteBatch,
  viewAll,
  updateStatus
};
