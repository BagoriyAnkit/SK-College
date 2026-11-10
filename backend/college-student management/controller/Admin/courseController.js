const course = require('../../model/admin/course');
const Batch = require('../../model/admin/batch');
const Student = require('../../model/admin/student');

const viewAllCourse = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Website call (without pagination)
    if (!page && !limit) {
      const courseData = await course
        .find({ status: "Active" })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        status: true,
        data: courseData,
      });
    }

    // Admin Panel (with pagination)
    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;

    const totalCourse = await course.countDocuments();

    const courseData = await course
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      status: true,
      data: courseData,
      currentPage,
      totalPages: Math.ceil(totalCourse / perPage),
      totalCourse,
      limit: perPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < Math.ceil(totalCourse / perPage),
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const addCourse = async (req, res) => {
  try {
    const { courseName, courseCode } = req.body;
    if (!courseName) {
      return res.status(400).json({
        status: false,
        message: "Course Name is required"
      });
    }

    const existingCourse = await course.findOne({
      $or: [
        { courseName: { $regex: new RegExp("^" + courseName.trim() + "$", "i") } },
        ...(courseCode ? [{ courseCode: { $regex: new RegExp("^" + courseCode.trim() + "$", "i") } }] : [])
      ]
    });

    if (existingCourse) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: "Course already exists with this name or code"
      });
    }

    const courseData = await course.create(req.body);
    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "course added successfully",
      data: courseData
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

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingCourse = await course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Course not found"
      });
    }

    // Check name collision with another course
    if (updateData.courseName && updateData.courseName.trim().toLowerCase() !== existingCourse.courseName.toLowerCase()) {
      const duplicate = await course.findOne({
        _id: { $ne: id },
        courseName: { $regex: new RegExp("^" + updateData.courseName.trim() + "$", "i") }
      });
      if (duplicate) {
        return res.status(409).json({
          status: false,
          statusCode: 409,
          message: "Another course already exists with this name"
        });
      }
    }

    const updatedCourse = await course.findByIdAndUpdate(id, updateData, { new: true });

    // Synchronize courseName string across linked batches
    if (updateData.courseName && updateData.courseName !== existingCourse.courseName) {
      await Batch.updateMany(
        { course: id },
        { $set: { courseName: updateData.courseName } }
      );
      // Synchronize Course name in students
      await Student.updateMany(
        { Course: existingCourse.courseName },
        { $set: { Course: updateData.courseName } }
      );
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "update course successfully",
      data: updatedCourse
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

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const courseDoc = await course.findById(id);
    if (!courseDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Course not found"
      });
    }

    // Referential integrity check: check if batches are assigned to this course
    const assignedBatches = await Batch.countDocuments({
      $or: [{ course: id }, { courseName: courseDoc.courseName }]
    });
    if (assignedBatches > 0) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: `Cannot delete course. There are ${assignedBatches} batch(es) assigned to this course. Please reassign or delete the batches first.`
      });
    }

    // Check if students are enrolled in this course
    const enrolledStudents = await Student.countDocuments({
      Course: courseDoc.courseName
    });
    if (enrolledStudents > 0) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: `Cannot delete course. There are ${enrolledStudents} student(s) currently enrolled in this course. Please reassign them first.`
      });
    }

    const courseData = await course.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "delete course successfully",
      data: courseData
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

const findcourse = async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = await course.findById(id);

    if (!courseData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Course not found"
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "course found successfully",
      data: courseData
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

    const courseData = await course.findById(id);

    if (!courseData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "course not found",
      });
    }

    // Toggle Status
    courseData.status =
      courseData.status === "Active" ? "Inactive" : "Active";

    await courseData.save();

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "course status updated successfully",
      data: courseData,
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Error updating status",
      error: error.message,
    });
  }
};

module.exports = {
  viewAllCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  findcourse,
  updateStatus
};
