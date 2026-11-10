const mongoose = require("mongoose");
const examModel = require("../../model/admin/exam");
const marksModel = require("../../model/admin/marks");
const courseModel = require("../../model/admin/course");
const batchModel = require("../../model/admin/batch");
const studentModel = require("../../model/admin/student");

/**
 * Resolves Course and Batch ObjectId references and human-readable names.
 */
const resolveCourseAndBatch = async (courseIdOrName, batchIdOrName) => {
  let courseObj = null;
  let batchObj = null;

  // Resolve Course
  if (courseIdOrName) {
    if (mongoose.Types.ObjectId.isValid(courseIdOrName)) {
      courseObj = await courseModel.findById(courseIdOrName);
    }
    if (!courseObj) {
      courseObj = await courseModel.findOne({
        courseName: new RegExp(`^${String(courseIdOrName).trim()}$`, "i")
      });
    }
  }

  // Resolve Batch
  if (batchIdOrName) {
    if (mongoose.Types.ObjectId.isValid(batchIdOrName)) {
      batchObj = await batchModel.findById(batchIdOrName);
    }
    if (!batchObj) {
      batchObj = await batchModel.findOne({
        batchName: new RegExp(`^${String(batchIdOrName).trim()}$`, "i")
      });
    }
  }

  return {
    courseId: courseObj?._id || (mongoose.Types.ObjectId.isValid(courseIdOrName) ? new mongoose.Types.ObjectId(courseIdOrName) : null),
    courseName: courseObj?.courseName || (typeof courseIdOrName === "string" ? courseIdOrName.trim() : ""),
    batchId: batchObj?._id || (mongoose.Types.ObjectId.isValid(batchIdOrName) ? new mongoose.Types.ObjectId(batchIdOrName) : null),
    batchName: batchObj?.batchName || (typeof batchIdOrName === "string" ? batchIdOrName.trim() : "")
  };
};

/**
 * Computes percentage, academic letter grade, and Pass/Fail status.
 */
const calculateGradeAndStatus = (marksObtained, maxMarks, minMarks = 33) => {
  const safeMax = Number(maxMarks) > 0 ? Number(maxMarks) : 100;
  const safeMarks = Number(marksObtained) || 0;
  const percentage = Number(((safeMarks / safeMax) * 100).toFixed(2));
  const isPass = safeMarks >= Number(minMarks);

  let grade = "F";
  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B+";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 50) grade = "C";
  else if (percentage >= 35 || isPass) grade = "D";

  return {
    percentage,
    grade,
    status: isPass ? "Pass" : "Fail"
  };
};

/**
 * Calculates aggregate total obtained marks, maximum marks, percentage,
 * letter grade, and pass/fail result across multiple entered subject marks.
 *
 * Existing passing criteria:
 * - Each subject evaluated against exam.minMarks (default 33).
 * - A student passes overall if they passed ALL entered subjects and overall percentage >= 33%.
 * - If marksObtained < minMarks for any entered subject, final result is "Fail".
 * - If 0 marks recorded, result is "Pending".
 */
const calculateAggregateResult = (marksList = []) => {
  if (!marksList || marksList.length === 0) {
    return {
      totalObtained: 0,
      totalMaxMarks: 0,
      percentage: 0,
      grade: "N/A",
      resultStatus: "Pending",
      enteredSubjectsCount: 0,
      passedSubjectsCount: 0,
      failedSubjectsCount: 0
    };
  }

  let totalObtained = 0;
  let totalMaxMarks = 0;
  let passedSubjectsCount = 0;
  let failedSubjectsCount = 0;

  marksList.forEach((m) => {
    const obtained = Number(m.marksObtained) || 0;
    const max = Number(m.maxMarks) > 0 ? Number(m.maxMarks) : (m.exam?.maxMarks || 100);
    const min = Number(m.exam?.minMarks !== undefined ? m.exam.minMarks : 33);

    totalObtained += obtained;
    totalMaxMarks += max;

    const isSubPass = m.status === "Pass" || obtained >= min;
    if (isSubPass) {
      passedSubjectsCount++;
    } else {
      failedSubjectsCount++;
    }
  });

  const percentage = totalMaxMarks > 0
    ? Number(((totalObtained / totalMaxMarks) * 100).toFixed(2))
    : 0;

  const hasFailedSubject = failedSubjectsCount > 0;
  const isPass = !hasFailedSubject && percentage >= 33;

  let grade = "F";
  if (!hasFailedSubject) {
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 33 || isPass) grade = "D";
  }

  return {
    totalObtained: Number(totalObtained.toFixed(2)),
    totalMaxMarks: Number(totalMaxMarks.toFixed(2)),
    percentage,
    grade,
    resultStatus: hasFailedSubject ? "Fail" : (isPass ? "Pass" : "Fail"),
    enteredSubjectsCount: marksList.length,
    passedSubjectsCount,
    failedSubjectsCount
  };
};

/**
 * 1. Add Exam
 */
const addExam = async (req, res) => {
  try {
    const rawExamName = req.body.examName || req.body.ExamName;
    const rawSubject = req.body.subject;
    const rawMaxMarks = req.body.maxMarks !== undefined ? req.body.maxMarks : req.body.MaxMarks;
    const rawMinMarks = req.body.minMarks !== undefined ? req.body.minMarks : req.body.MinMarks;
    const rawExamDate = req.body.examDate || req.body.StartDate;

    if (!rawExamName) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Exam name is required"
      });
    }

    if (!rawSubject) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Subject is required"
      });
    }

    const maxMarks = Number(rawMaxMarks);
    if (isNaN(maxMarks) || maxMarks <= 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Maximum marks must be a number greater than 0"
      });
    }

    const minMarks = Number(rawMinMarks !== undefined ? rawMinMarks : 33);
    if (minMarks < 0 || minMarks > maxMarks) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Passing marks cannot be negative or greater than maximum marks"
      });
    }

    const { courseId, courseName, batchId, batchName } = await resolveCourseAndBatch(
      req.body.course || req.body.courseId || req.body.courseName,
      req.body.batch || req.body.batchId || req.body.batchName || req.body.ClassId
    );

    const examData = await examModel.create({
      examName: rawExamName.trim(),
      ExamName: rawExamName.trim(),
      examType: req.body.examType || "Semester",
      course: courseId,
      courseName: courseName,
      batch: batchId,
      batchName: batchName,
      ClassId: batchName || req.body.ClassId || "",
      subject: rawSubject.trim(),
      examDate: rawExamDate ? new Date(rawExamDate) : new Date(),
      StartDate: rawExamDate ? new Date(rawExamDate) : new Date(),
      EndDate: req.body.EndDate ? new Date(req.body.EndDate) : (rawExamDate ? new Date(rawExamDate) : new Date()),
      maxMarks,
      MaxMarks: maxMarks,
      minMarks,
      MinMarks: minMarks,
      academicYear: req.body.academicYear || req.body.AcademicYear || "2026-27",
      AcademicYear: req.body.academicYear || req.body.AcademicYear || "2026-27",
      status: req.body.status || "Scheduled"
    });

    const populatedExam = await examModel
      .findById(examData._id)
      .populate("course", "courseName courseCode duration")
      .populate("batch", "batchName session strength");

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Exam added successfully",
      data: populatedExam
    });
  } catch (error) {
    console.error("ADD EXAM ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to add exam"
    });
  }
};

/**
 * 2. Find Exam by ID
 */
const findExam = async (req, res) => {
  try {
    const { id } = req.params;
    const examData = await examModel
      .findById(id)
      .populate("course", "courseName courseCode duration")
      .populate("batch", "batchName session strength");

    if (!examData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Exam not found"
      });
    }

    const marksCount = await marksModel.countDocuments({ exam: id });
    const resultObj = examData.toObject();
    resultObj.marksCount = marksCount;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Found exam successfully",
      data: resultObj
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error finding exam"
    });
  }
};

/**
 * 3. Update Exam
 */
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const existingExam = await examModel.findById(id);

    if (!existingExam) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Exam not found"
      });
    }

    const rawExamName = req.body.examName || req.body.ExamName;
    if (rawExamName) {
      existingExam.examName = rawExamName.trim();
      existingExam.ExamName = rawExamName.trim();
    }

    if (req.body.examType) existingExam.examType = req.body.examType;
    if (req.body.subject) existingExam.subject = req.body.subject.trim();

    if (req.body.course || req.body.courseId || req.body.courseName || req.body.batch || req.body.batchId || req.body.batchName || req.body.ClassId) {
      const { courseId, courseName, batchId, batchName } = await resolveCourseAndBatch(
        req.body.course || req.body.courseId || req.body.courseName || existingExam.course,
        req.body.batch || req.body.batchId || req.body.batchName || req.body.ClassId || existingExam.batch
      );
      if (courseId) existingExam.course = courseId;
      if (courseName) existingExam.courseName = courseName;
      if (batchId) existingExam.batch = batchId;
      if (batchName) {
        existingExam.batchName = batchName;
        existingExam.ClassId = batchName;
      }
    }

    const rawExamDate = req.body.examDate || req.body.StartDate;
    if (rawExamDate) {
      existingExam.examDate = new Date(rawExamDate);
      existingExam.StartDate = new Date(rawExamDate);
    }
    if (req.body.EndDate) existingExam.EndDate = new Date(req.body.EndDate);

    const rawMaxMarks = req.body.maxMarks !== undefined ? req.body.maxMarks : req.body.MaxMarks;
    if (rawMaxMarks !== undefined) {
      const newMaxMarks = Number(rawMaxMarks);
      if (isNaN(newMaxMarks) || newMaxMarks <= 0) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Maximum marks must be a number greater than 0"
        });
      }
      existingExam.maxMarks = newMaxMarks;
      existingExam.MaxMarks = newMaxMarks;
    }

    const rawMinMarks = req.body.minMarks !== undefined ? req.body.minMarks : req.body.MinMarks;
    if (rawMinMarks !== undefined) {
      existingExam.minMarks = Number(rawMinMarks);
      existingExam.MinMarks = Number(rawMinMarks);
    }

    if (req.body.academicYear || req.body.AcademicYear) {
      const year = req.body.academicYear || req.body.AcademicYear;
      existingExam.academicYear = year;
      existingExam.AcademicYear = year;
    }

    if (req.body.status) existingExam.status = req.body.status;

    await existingExam.save();

    const updatedExam = await examModel
      .findById(id)
      .populate("course", "courseName courseCode duration")
      .populate("batch", "batchName session strength");

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Exam updated successfully",
      data: updatedExam
    });
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating exam"
    });
  }
};

/**
 * 4. Delete Exam (with Cascade cleanup of associated marks)
 */
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const examData = await examModel.findByIdAndDelete(id);

    if (!examData) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Exam not found"
      });
    }

    // Cascade delete any marks linked to this exam
    await marksModel.deleteMany({ exam: id });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Exam deleted successfully",
      data: examData
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error deleting exam"
    });
  }
};

/**
 * 5. View All Exams with pagination and populated Course & Batch
 */
const viewAllExam = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await examModel.countDocuments();
    const exams = await examModel
      .find()
      .populate("course", "courseName courseCode duration")
      .populate("batch", "batchName session strength")
      .sort({ examDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Attach marksCount for each exam
    const examsWithCounts = await Promise.all(
      exams.map(async (doc) => {
        const item = doc.toObject();
        item.marksCount = await marksModel.countDocuments({ exam: item._id });
        return item;
      })
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Exams found successfully",
      data: examsWithCounts,
      total,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching exams"
    });
  }
};

/**
 * =========================================================================
 * MARKS MANAGEMENT CONTROLLERS
 * =========================================================================
 */

/**
 * Helper to resolve Student record by ObjectId, Name, or Roll Number
 */
const resolveStudent = async (studentIdOrKey) => {
  if (!studentIdOrKey) return null;

  if (mongoose.Types.ObjectId.isValid(studentIdOrKey)) {
    const stu = await studentModel.findById(studentIdOrKey);
    if (stu) return stu;
  }

  const str = String(studentIdOrKey).trim();
  const byRoll = await studentModel.findOne({
    $or: [
      { rollNumber: new RegExp(`^${str}$`, "i") },
      { RollNumber: new RegExp(`^${str}$`, "i") }
    ]
  });
  if (byRoll) return byRoll;

  const byName = await studentModel.findOne({
    StudentName: new RegExp(`^${str}$`, "i")
  });
  return byName;
};

/**
 * 6. Add / Enter Student Marks
 * - Validates obtained marks >= 0 and <= maxMarks
 * - Prevents duplicate marks entries for same student and exam
 */
const addMarks = async (req, res) => {
  try {
    const examId = req.params.id || req.body.exam || req.body.examId;
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Valid Exam ID is required"
      });
    }

    const examDoc = await examModel.findById(examId);
    if (!examDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Exam not found"
      });
    }

    const maxMarks = Number(req.body.maxMarks || examDoc.maxMarks || examDoc.MaxMarks || 100);

    // 4. Validate obtained marks cannot be negative or greater than maximum marks
    const marksObtained = Number(req.body.marksObtained);
    if (req.body.marksObtained === undefined || isNaN(marksObtained)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Marks obtained must be a valid number"
      });
    }

    if (marksObtained < 0) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Obtained marks cannot be negative"
      });
    }

    if (marksObtained > maxMarks) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: `Obtained marks (${marksObtained}) cannot be greater than maximum marks (${maxMarks})`
      });
    }

    const rawStudent = req.body.student || req.body.studentId || req.body.studentName || req.body.rollNumber;
    if (!rawStudent) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Student is required"
      });
    }

    const studentDoc = await resolveStudent(rawStudent);
    if (!studentDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: `Student '${rawStudent}' not found in records`
      });
    }

    // 5. Prevent duplicate marks entries for the same student and exam
    const existingMarks = await marksModel.findOne({
      exam: examDoc._id,
      student: studentDoc._id
    });

    if (existingMarks) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: `Marks entry already exists for student '${studentDoc.StudentName}' in this exam. Please update the existing record instead.`
      });
    }

    const minMarks = Number(examDoc.minMarks !== undefined ? examDoc.minMarks : (examDoc.MinMarks !== undefined ? examDoc.MinMarks : 33));
    const { percentage, grade, status } = calculateGradeAndStatus(marksObtained, maxMarks, minMarks);

    const newMarks = await marksModel.create({
      exam: examDoc._id,
      student: studentDoc._id,
      studentName: studentDoc.StudentName || "Student",
      rollNumber: studentDoc.rollNumber || studentDoc.RollNumber || "",
      course: examDoc.course || studentDoc.course || null,
      courseName: examDoc.courseName || studentDoc.Course || "",
      batch: examDoc.batch || studentDoc.batch || null,
      batchName: examDoc.batchName || "",
      subject: examDoc.subject || "General Subject",
      marksObtained,
      maxMarks,
      percentage,
      grade,
      status,
      remarks: req.body.remarks ? String(req.body.remarks).trim() : ""
    });

    const populatedMarks = await marksModel
      .findById(newMarks._id)
      .populate("student", "StudentName email rollNumber Phonenumber Course")
      .populate("exam", "examName examType subject maxMarks minMarks examDate");

    return res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Marks recorded successfully",
      data: populatedMarks
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        statusCode: 409,
        message: "Duplicate marks entry: marks have already been recorded for this student in this exam"
      });
    }
    console.error("ADD MARKS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to record marks"
    });
  }
};

/**
 * 7. Update Student Marks
 * - Validates obtained marks >= 0 and <= maxMarks
 */
const updateMarks = async (req, res) => {
  try {
    const marksId = req.params.marksId || req.params.id;
    const markDoc = await marksModel.findById(marksId);

    if (!markDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Marks record not found"
      });
    }

    const examDoc = await examModel.findById(markDoc.exam);
    const maxMarks = Number(req.body.maxMarks || (examDoc ? (examDoc.maxMarks || examDoc.MaxMarks) : markDoc.maxMarks));

    if (req.body.marksObtained !== undefined) {
      const marksObtained = Number(req.body.marksObtained);
      if (isNaN(marksObtained)) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Marks obtained must be a valid number"
        });
      }

      if (marksObtained < 0) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Obtained marks cannot be negative"
        });
      }

      if (marksObtained > maxMarks) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: `Obtained marks (${marksObtained}) cannot be greater than maximum marks (${maxMarks})`
        });
      }

      const minMarks = Number(examDoc ? (examDoc.minMarks ?? examDoc.MinMarks ?? 33) : 33);
      const { percentage, grade, status } = calculateGradeAndStatus(marksObtained, maxMarks, minMarks);

      markDoc.marksObtained = marksObtained;
      markDoc.maxMarks = maxMarks;
      markDoc.percentage = percentage;
      markDoc.grade = grade;
      markDoc.status = status;
    }

    if (req.body.remarks !== undefined) {
      markDoc.remarks = String(req.body.remarks).trim();
    }

    await markDoc.save();

    const updatedMarks = await marksModel
      .findById(marksId)
      .populate("student", "StudentName email rollNumber Phonenumber Course")
      .populate("exam", "examName examType subject maxMarks minMarks examDate");

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Marks updated successfully",
      data: updatedMarks
    });
  } catch (error) {
    console.error("UPDATE MARKS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error updating marks"
    });
  }
};

/**
 * 8. Display Exam-wise Student Marks List
 */
const getExamMarks = async (req, res) => {
  try {
    const examId = req.params.id || req.params.examId;
    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Valid Exam ID is required"
      });
    }

    const examDoc = await examModel
      .findById(examId)
      .populate("course", "courseName courseCode duration")
      .populate("batch", "batchName session strength");

    if (!examDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Exam not found"
      });
    }

    const marksList = await marksModel
      .find({ exam: examId })
      .populate("student", "StudentName email rollNumber Phonenumber Course Batch")
      .sort({ rollNumber: 1, studentName: 1, createdAt: 1 });

    const totalStudents = marksList.length;
    const passed = marksList.filter((m) => m.status === "Pass").length;
    const failed = marksList.filter((m) => m.status === "Fail").length;
    const highestMarks = totalStudents > 0 ? Math.max(...marksList.map((m) => m.marksObtained)) : 0;
    const avgPercentage =
      totalStudents > 0
        ? Number((marksList.reduce((acc, m) => acc + m.percentage, 0) / totalStudents).toFixed(2))
        : 0;

    // Detect students in the batch with missing / pending marks
    let pendingStudents = [];
    if (examDoc.batch) {
      const gradedStudentIds = new Set(
        marksList.map((m) => (m.student?._id || m.student)?.toString()).filter(Boolean)
      );

      const batchStudents = await studentModel
        .find({
          $or: [
            { batch: examDoc.batch },
            { Batch: examDoc.batchName }
          ],
          status: { $ne: "Deleted" }
        })
        .select("StudentName rollNumber RollNumber email Phonenumber")
        .sort({ rollNumber: 1, StudentName: 1 })
        .lean();

      pendingStudents = batchStudents
        .filter((s) => !gradedStudentIds.has(s._id.toString()))
        .map((s) => ({
          _id: s._id,
          name: s.StudentName,
          rollNumber: s.rollNumber || s.RollNumber || "N/A",
          email: s.email,
          status: "Pending Marks"
        }));
    }

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Exam marks fetched successfully",
      exam: examDoc,
      data: marksList,
      summary: {
        totalStudents,
        passed,
        failed,
        highestMarks,
        avgPercentage,
        pendingStudentsCount: pendingStudents.length
      },
      pendingStudents
    });
  } catch (error) {
    console.error("GET EXAM MARKS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching exam marks"
    });
  }
};

/**
 * 9. Delete Marks Record
 */
const deleteMarks = async (req, res) => {
  try {
    const marksId = req.params.marksId || req.params.id;
    const deleted = await marksModel.findByIdAndDelete(marksId);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Marks record not found"
      });
    }

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Marks record deleted successfully",
      data: deleted
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error deleting marks record"
    });
  }
};

/**
 * 10. Get Student Marks across all exams
 */
const getStudentMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const marksList = await marksModel
      .find({ student: studentId })
      .populate("exam", "examName examType subject maxMarks minMarks examDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Student marks fetched successfully",
      data: marksList
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Error fetching student marks"
    });
  }
};

/**
 * 11. Get Student Marksheet
 * Generates an official student-wise marksheet with subject-wise marks,
 * totals, percentage, grade, pass/fail result, and missing marks audit.
 */
const getStudentMarksheet = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.params.id;
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Valid Student ID is required"
      });
    }

    const studentDoc = await studentModel
      .findById(studentId)
      .populate("batch", "batchName session strength")
      .populate("department", "departmentName");

    if (!studentDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Student record not found"
      });
    }

    // Optional query filters: batchId, academicYear, examType
    const marksFilter = { student: studentId };
    if (req.query.batchId && mongoose.Types.ObjectId.isValid(req.query.batchId)) {
      marksFilter.batch = req.query.batchId;
    }

    const marksList = await marksModel
      .find(marksFilter)
      .populate("exam", "examName examType subject maxMarks minMarks examDate academicYear")
      .populate("course", "courseName")
      .populate("batch", "batchName")
      .sort({ createdAt: 1 });

    // Look up scheduled exams for this student's batch to check for missing/unentered marks
    let batchExams = [];
    const studentBatchId = studentDoc.batch?._id || studentDoc.batch;
    if (studentBatchId) {
      const examQuery = { batch: studentBatchId };
      if (req.query.academicYear) examQuery.academicYear = req.query.academicYear;
      if (req.query.examType) examQuery.examType = req.query.examType;
      batchExams = await examModel.find(examQuery).lean();
    }

    // Determine which batch exams have been entered vs missing
    const enteredExamIds = new Set(
      marksList
        .map((m) => (m.exam?._id || m.exam)?.toString())
        .filter(Boolean)
    );

    const missingExams = batchExams
      .filter((ex) => !enteredExamIds.has(ex._id.toString()))
      .map((ex) => ({
        examId: ex._id,
        examName: ex.examName || ex.ExamName,
        examType: ex.examType,
        subject: ex.subject,
        maxMarks: ex.maxMarks || ex.MaxMarks || 100,
        minMarks: ex.minMarks !== undefined ? ex.minMarks : 33,
        status: "Not Entered"
      }));

    // Calculate totals, percentage, grade, and pass/fail on entered marks
    const aggregate = calculateAggregateResult(marksList);

    // Subject-wise breakdown for marksheet
    const subjects = marksList.map((m) => ({
      marksId: m._id,
      examId: m.exam?._id || m.exam,
      examName: m.exam?.examName || m.exam?.ExamName || "Exam",
      examType: m.exam?.examType || "Semester",
      subject: m.subject || m.exam?.subject || "Subject",
      maxMarks: m.maxMarks || m.exam?.maxMarks || 100,
      minMarks: m.exam?.minMarks !== undefined ? m.exam.minMarks : 33,
      marksObtained: m.marksObtained,
      percentage: m.percentage,
      grade: m.grade,
      status: m.status, // "Pass" or "Fail"
      remarks: m.remarks || "",
      examDate: m.exam?.examDate || null
    }));

    const isComplete = missingExams.length === 0;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Student marksheet generated successfully",
      student: {
        _id: studentDoc._id,
        name: studentDoc.StudentName,
        rollNumber: studentDoc.rollNumber || studentDoc.RollNumber || "N/A",
        email: studentDoc.email,
        phone: studentDoc.Phonenumber,
        course: studentDoc.course?.courseName || studentDoc.Course || "General Course",
        batch: studentDoc.batch?.batchName || "N/A",
        batchId: studentDoc.batch?._id || null,
        department: studentDoc.department?.departmentName || "General",
        semester: studentDoc.semester || 1,
        parentName: studentDoc.parentName || "N/A",
        parentContact: studentDoc.parentContact || "N/A"
      },
      marksheet: {
        subjects,
        totalObtained: aggregate.totalObtained,
        totalMaxMarks: aggregate.totalMaxMarks,
        percentage: aggregate.percentage,
        grade: aggregate.grade,
        result: aggregate.resultStatus, // "Pass", "Fail", or "Pending"
        enteredSubjectsCount: aggregate.enteredSubjectsCount,
        passedSubjectsCount: aggregate.passedSubjectsCount,
        failedSubjectsCount: aggregate.failedSubjectsCount,
        totalScheduledExams: batchExams.length,
        isComplete,
        missingExamsCount: missingExams.length,
        missingExams,
        generatedAt: new Date(),
        academicYear: marksList[0]?.exam?.academicYear || "2026-27"
      }
    });
  } catch (error) {
    console.error("GET STUDENT MARKSHEET ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to generate marksheet"
    });
  }
};

/**
 * 12. Get Batch-wise Results
 * Aggregates exam marks across all students in a batch with summary KPIs,
 * individual student totals, percentages, pass/fail status, and missing marks audit.
 */
const getBatchResults = async (req, res) => {
  try {
    const batchId = req.params.batchId || req.query.batchId;
    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Valid Batch ID is required"
      });
    }

    const batchDoc = await batchModel
      .findById(batchId)
      .populate("course", "courseName courseCode duration")
      .populate("classTeacher", "name email");

    if (!batchDoc) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Batch not found"
      });
    }

    // Optional filters: examType, academicYear
    const examFilter = { batch: batchId };
    if (req.query.examType) examFilter.examType = req.query.examType;
    if (req.query.academicYear) examFilter.academicYear = req.query.academicYear;

    // Find all exams scheduled for this batch
    const batchExams = await examModel.find(examFilter).sort({ examDate: 1, createdAt: 1 }).lean();
    const batchExamIds = batchExams.map((e) => e._id);

    // Find all students enrolled in this batch
    const studentsInBatch = await studentModel
      .find({
        $or: [
          { batch: batchId },
          { Batch: batchDoc.batchName }
        ],
        status: { $ne: "Deleted" }
      })
      .sort({ rollNumber: 1, StudentName: 1 })
      .lean();

    // Find all marks for these exams (or for these students in this batch)
    const marksFilter = {
      $or: [
        { batch: batchId },
        { exam: { $in: batchExamIds } }
      ]
    };
    const allMarks = await marksModel
      .find(marksFilter)
      .populate("exam", "examName examType subject maxMarks minMarks")
      .lean();

    // Map marks by studentId
    const marksByStudent = new Map();
    allMarks.forEach((m) => {
      const sId = m.student?.toString();
      if (!sId) return;
      if (!marksByStudent.has(sId)) {
        marksByStudent.set(sId, []);
      }
      marksByStudent.get(sId).push(m);
    });

    // Compute result for each student
    const studentResults = studentsInBatch.map((stu) => {
      const sId = stu._id.toString();
      const studentMarks = marksByStudent.get(sId) || [];
      const aggregate = calculateAggregateResult(studentMarks);

      // Map subject-wise marks
      const enteredExamIds = new Set(
        studentMarks.map((m) => (m.exam?._id || m.exam)?.toString()).filter(Boolean)
      );

      const missingExams = batchExams
        .filter((ex) => !enteredExamIds.has(ex._id.toString()))
        .map((ex) => ({
          examId: ex._id,
          subject: ex.subject,
          examName: ex.examName || ex.ExamName,
          maxMarks: ex.maxMarks || ex.MaxMarks || 100,
          minMarks: ex.minMarks !== undefined ? ex.minMarks : 33
        }));

      let marksStatus = "Complete";
      if (studentMarks.length === 0) {
        marksStatus = "No Marks";
      } else if (missingExams.length > 0) {
        marksStatus = "Incomplete";
      }

      return {
        studentId: stu._id,
        studentName: stu.StudentName,
        rollNumber: stu.rollNumber || stu.RollNumber || "N/A",
        email: stu.email,
        phone: stu.Phonenumber,
        courseName: batchDoc.course?.courseName || batchDoc.courseName || stu.Course || "",
        totalObtained: aggregate.totalObtained,
        totalMaxMarks: aggregate.totalMaxMarks,
        percentage: aggregate.percentage,
        grade: aggregate.grade,
        resultStatus: aggregate.resultStatus, // "Pass", "Fail", or "Pending"
        enteredSubjectsCount: studentMarks.length,
        totalScheduledExams: batchExams.length,
        missingExamsCount: missingExams.length,
        missingExams,
        marksStatus,
        marksList: studentMarks.map((m) => ({
          marksId: m._id,
          subject: m.subject || m.exam?.subject || "Subject",
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          percentage: m.percentage,
          grade: m.grade,
          status: m.status
        }))
      };
    });

    // Compute batch-level summary KPIs
    const totalStudents = studentResults.length;
    const appearedStudents = studentResults.filter((s) => s.enteredSubjectsCount > 0).length;
    const passedStudents = studentResults.filter((s) => s.resultStatus === "Pass").length;
    const failedStudents = studentResults.filter((s) => s.resultStatus === "Fail").length;
    const pendingStudents = studentResults.filter((s) => s.resultStatus === "Pending").length;

    const evaluatedStudents = studentResults.filter((s) => s.totalMaxMarks > 0);
    const batchAveragePercentage =
      evaluatedStudents.length > 0
        ? Number(
            (
              evaluatedStudents.reduce((acc, s) => acc + s.percentage, 0) /
              evaluatedStudents.length
            ).toFixed(2)
          )
        : 0;

    const highestPercentage =
      evaluatedStudents.length > 0
        ? Math.max(...evaluatedStudents.map((s) => s.percentage))
        : 0;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Batch results fetched successfully",
      batch: {
        _id: batchDoc._id,
        batchName: batchDoc.batchName,
        course: batchDoc.course,
        courseName: batchDoc.course?.courseName || batchDoc.courseName,
        session: batchDoc.session,
        strength: batchDoc.strength
      },
      scheduledExams: batchExams.map((ex) => ({
        _id: ex._id,
        examName: ex.examName || ex.ExamName,
        subject: ex.subject,
        examType: ex.examType,
        maxMarks: ex.maxMarks || ex.MaxMarks || 100,
        minMarks: ex.minMarks !== undefined ? ex.minMarks : 33,
        examDate: ex.examDate
      })),
      data: studentResults,
      summary: {
        totalStudents,
        appearedStudents,
        passedStudents,
        failedStudents,
        pendingStudents,
        batchAveragePercentage,
        highestPercentage
      }
    });
  } catch (error) {
    console.error("GET BATCH RESULTS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to fetch batch results"
    });
  }
};

module.exports = {
  addExam,
  findExam,
  updateExam,
  deleteExam,
  viewAllExam,
  addMarks,
  updateMarks,
  getExamMarks,
  deleteMarks,
  getStudentMarks,
  getStudentMarksheet,
  getBatchResults
};
