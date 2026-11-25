const mongoose = require("mongoose");
const studentModel = require("../../model/admin/student");
const facultyModel = require("../../model/admin/faculty");
const courseModel = require("../../model/admin/course");
const batchModel = require("../../model/admin/batch");
const departmentModel = require("../../model/admin/department");
const feesModel = require("../../model/admin/fees");
const admissionModel = require("../../model/admin/admission");
const examModel = require("../../model/admin/exam");
const marksModel = require("../../model/admin/marks");

/**
 * Controller to fetch role-aware dashboard statistics from MongoDB.
 * Serves tailored metrics for Admin, HOD, Teacher, and Accountant.
 */
const getDashboardStats = async (req, res) => {
  try {
    const userRole = String(req.user?.role || "admin").toLowerCase().trim();

    // =========================================================================
    // 1. HEAD OF DEPARTMENT (HOD) DASHBOARD
    // Scoped strictly to the HOD's assigned department.
    // =========================================================================
    if (userRole === "hod") {
      // Resolve linked faculty record
      let facultyRecord = null;
      if (req.user.facultyId && mongoose.Types.ObjectId.isValid(req.user.facultyId)) {
        facultyRecord = await facultyModel.findById(req.user.facultyId);
      }
      if (!facultyRecord && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        facultyRecord = await facultyModel.findOne({ userId: req.user.id });
      }
      if (!facultyRecord && req.user.email) {
        facultyRecord = await facultyModel.findOne({
          Email: new RegExp(`^${req.user.email.trim()}$`, "i")
        });
      }

      // Resolve department
      let departmentDoc = null;
      if (facultyRecord) {
        if (facultyRecord.department) {
          departmentDoc = await departmentModel.findById(facultyRecord.department);
        }
        if (!departmentDoc) {
          departmentDoc = await departmentModel.findOne({ hod: facultyRecord._id });
        }
        if (!departmentDoc && facultyRecord.Department) {
          departmentDoc = await departmentModel.findOne({
            DepartmentName: new RegExp(`^${facultyRecord.Department.trim()}$`, "i")
          });
        }
        if (!departmentDoc && facultyRecord.TeacherName) {
          departmentDoc = await departmentModel.findOne({
            HOD: new RegExp(`^${facultyRecord.TeacherName.trim()}$`, "i")
          });
        }
      }

      // Fallback matching by user name
      if (!departmentDoc && req.user.name) {
        departmentDoc = await departmentModel.findOne({
          HOD: new RegExp(`^${req.user.name.trim()}$`, "i")
        });
      }

      if (departmentDoc) {
        const deptId = departmentDoc._id;
        const deptName = departmentDoc.DepartmentName;
        const deptCode = departmentDoc.DepartmentCode;

        // Department Courses
        const deptCourses = await courseModel
          .find({
            $or: [
              { department: deptName },
              { department: new RegExp(`^${deptName}$`, "i") },
              { department: String(deptId) }
            ]
          })
          .lean();
        const deptCourseIds = deptCourses.map((c) => c._id);
        const deptCourseNames = deptCourses.map((c) => c.courseName);

        // Department Batches
        const deptBatches = await batchModel
          .find({
            $or: [
              { course: { $in: deptCourseIds } },
              { courseName: { $in: deptCourseNames } }
            ]
          })
          .populate("classTeacher", "TeacherName Email")
          .lean();
        const deptBatchIds = deptBatches.map((b) => b._id);
        const deptBatchNames = deptBatches.map((b) => b.batchName);

        // Department Faculty
        const deptFaculty = await facultyModel
          .find({
            $or: [
              { department: deptId },
              { Department: deptName },
              { Department: new RegExp(`^${deptName}$`, "i") }
            ]
          })
          .lean();

        // Department Students
        const deptStudents = await studentModel
          .find({
            status: { $ne: "Deleted" },
            $or: [
              { department: deptId },
              { batch: { $in: deptBatchIds } },
              { Course: { $in: deptCourseNames } }
            ]
          })
          .populate("batch", "batchName")
          .sort({ createdAt: -1 })
          .lean();

        // Department Exams
        const deptExams = await examModel
          .find({
            $or: [
              { course: { $in: deptCourseIds } },
              { batch: { $in: deptBatchIds } },
              { courseName: { $in: deptCourseNames } },
              { batchName: { $in: deptBatchNames } }
            ]
          })
          .sort({ examDate: -1, createdAt: -1 })
          .lean();
        const deptExamIds = deptExams.map((e) => e._id);

        // Department Marks & Results
        const deptMarks = await marksModel
          .find({
            $or: [
              { exam: { $in: deptExamIds } },
              { batch: { $in: deptBatchIds } },
              { course: { $in: deptCourseIds } }
            ]
          })
          .lean();

        const activeStudents = deptStudents.filter((s) => s.status === "Active").length;
        const inactiveStudents = deptStudents.length - activeStudents;
        const activeFaculty = deptFaculty.filter((f) => f.status === "Active").length;
        const activeCourses = deptCourses.filter((c) => c.status === "Active").length;
        const activeBatches = deptBatches.filter((b) => b.status === true).length;

        const passedMarks = deptMarks.filter((m) => m.status === "Pass").length;
        const passRate =
          deptMarks.length > 0
            ? Number(((passedMarks / deptMarks.length) * 100).toFixed(1))
            : 0;

        // Course distribution within department
        const courseCounts = {};
        deptStudents.forEach((st) => {
          const cName = st.Course || "General";
          courseCounts[cName] = (courseCounts[cName] || 0) + 1;
        });
        const courseDistribution = Object.keys(courseCounts).map((cName) => ({
          courseName: cName,
          count: courseCounts[cName],
          percentage:
            deptStudents.length > 0
              ? Number(((courseCounts[cName] / deptStudents.length) * 100).toFixed(1))
              : 0
        }));

        return res.status(200).json({
          status: true,
          statusCode: 200,
          message: "HOD Dashboard statistics fetched successfully",
          data: {
            role: "hod",
            roleTitle: "Head of Department",
            department: {
              id: deptId,
              name: deptName,
              code: deptCode,
              hodName: facultyRecord?.TeacherName || departmentDoc.HOD || req.user.name || "HOD"
            },
            students: {
              total: deptStudents.length,
              active: activeStudents,
              inactive: inactiveStudents
            },
            faculty: {
              total: deptFaculty.length,
              active: activeFaculty
            },
            courses: {
              total: deptCourses.length,
              active: activeCourses
            },
            batches: {
              total: deptBatches.length,
              active: activeBatches
            },
            exams: {
              total: deptExams.length,
              gradedMarks: deptMarks.length,
              passedCount: passedMarks,
              passRate
            },
            courseDistribution,
            recentStudents: deptStudents.slice(0, 5),
            recentExams: deptExams.slice(0, 5)
          }
        });
      }

      // Department not yet assigned to HOD
      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "HOD Dashboard statistics fetched (No department assigned)",
        data: {
          role: "hod",
          roleTitle: "Head of Department",
          department: {
            id: null,
            name: "Unassigned Department",
            code: "N/A",
            hodName: facultyRecord?.TeacherName || req.user.name || "HOD"
          },
          students: { total: 0, active: 0, inactive: 0 },
          faculty: { total: 0, active: 0 },
          courses: { total: 0, active: 0 },
          batches: { total: 0, active: 0 },
          exams: { total: 0, gradedMarks: 0, passedCount: 0, passRate: 0 },
          courseDistribution: [],
          recentStudents: [],
          recentExams: []
        }
      });
    }

    // =========================================================================
    // 2. TEACHER DASHBOARD
    // Scoped strictly to batches & students assigned to the logged-in teacher.
    // =========================================================================
    if (userRole === "teacher") {
      let facultyRecord = null;
      if (req.user.facultyId && mongoose.Types.ObjectId.isValid(req.user.facultyId)) {
        facultyRecord = await facultyModel.findById(req.user.facultyId);
      }
      if (!facultyRecord && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        facultyRecord = await facultyModel.findOne({ userId: req.user.id });
      }
      if (!facultyRecord && req.user.email) {
        facultyRecord = await facultyModel.findOne({
          Email: new RegExp(`^${req.user.email.trim()}$`, "i")
        });
      }

      // Assigned batches where teacher is classTeacher
      const teacherBatches = facultyRecord
        ? await batchModel
            .find({ classTeacher: facultyRecord._id })
            .populate("course", "courseName")
            .lean()
        : [];
      const teacherBatchIds = teacherBatches.map((b) => b._id);
      const teacherBatchNames = teacherBatches.map((b) => b.batchName);

      // Students in teacher's batches
      const teacherStudents =
        teacherBatchIds.length > 0
          ? await studentModel
              .find({
                batch: { $in: teacherBatchIds },
                status: { $ne: "Deleted" }
              })
              .populate("batch", "batchName")
              .sort({ createdAt: -1 })
              .lean()
          : [];

      // Exams for teacher's batches
      const teacherExams =
        teacherBatchIds.length > 0
          ? await examModel
              .find({
                $or: [
                  { batch: { $in: teacherBatchIds } },
                  { batchName: { $in: teacherBatchNames } }
                ]
              })
              .sort({ examDate: -1, createdAt: -1 })
              .lean()
          : [];
      const teacherExamIds = teacherExams.map((e) => e._id);

      // Marks graded for teacher's batches or exams
      const teacherMarks =
        teacherExamIds.length > 0 || teacherBatchIds.length > 0
          ? await marksModel
              .find({
                $or: [
                  { exam: { $in: teacherExamIds } },
                  { batch: { $in: teacherBatchIds } }
                ]
              })
              .lean()
          : [];

      const activeStudents = teacherStudents.filter((s) => s.status === "Active").length;
      const inactiveStudents = teacherStudents.length - activeStudents;
      const passedMarks = teacherMarks.filter((m) => m.status === "Pass").length;
      const passRate =
        teacherMarks.length > 0
          ? Number(((passedMarks / teacherMarks.length) * 100).toFixed(1))
          : 0;

      const assignedBatchesSummary = teacherBatches.map((b) => ({
        id: b._id,
        batchName: b.batchName,
        courseName: b.course?.courseName || b.courseName || "General",
        session: b.session,
        strength: b.strength,
        status: b.status,
        enrolledCount: teacherStudents.filter(
          (s) => String(s.batch?._id || s.batch) === String(b._id)
        ).length
      }));

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Teacher Dashboard statistics fetched successfully",
        data: {
          role: "teacher",
          roleTitle: "Teacher / Faculty",
          teacherInfo: {
            id: facultyRecord?._id || null,
            name: facultyRecord?.TeacherName || req.user.name || "Teacher",
            email: facultyRecord?.Email || req.user.email || "",
            department: facultyRecord?.Department || "General"
          },
          batches: {
            total: teacherBatches.length,
            active: teacherBatches.filter((b) => b.status === true).length
          },
          students: {
            total: teacherStudents.length,
            active: activeStudents,
            inactive: inactiveStudents
          },
          exams: {
            total: teacherExams.length,
            gradedMarks: teacherMarks.length,
            passedCount: passedMarks,
            passRate
          },
          assignedBatches: assignedBatchesSummary,
          recentStudents: teacherStudents.slice(0, 5),
          recentExams: teacherExams.slice(0, 5)
        }
      });
    }

    // =========================================================================
    // 3. ACCOUNTANT DASHBOARD
    // Focused strictly on Fees collection, pending dues, receipts & transactions.
    // =========================================================================
    if (userRole === "accountant") {
      const feeAgg = await feesModel.aggregate([
        {
          $group: {
            _id: null,
            totalFees: { $sum: "$totalFees" },
            paidAmount: { $sum: "$paidAmount" },
            dueAmount: { $sum: "$dueAmount" },
            discount: { $sum: "$discount" },
            totalRecords: { $sum: 1 }
          }
        }
      ]);

      const feeTotals = feeAgg[0] || {
        totalFees: 0,
        paidAmount: 0,
        dueAmount: 0,
        discount: 0,
        totalRecords: 0
      };

      const [paidFeeRecords, partialFeeRecords, pendingFeeRecords] = await Promise.all([
        feesModel.countDocuments({ status: "Paid" }),
        feesModel.countDocuments({ status: "Partial" }),
        feesModel.countDocuments({ status: "Pending" })
      ]);

      const collectionRate =
        feeTotals.totalFees > 0
          ? Number(((feeTotals.paidAmount / feeTotals.totalFees) * 100).toFixed(1))
          : 0;

      // Unroll recent payments to show individual receipts & transactions
      const feesWithPayments = await feesModel
        .find({ "payments.0": { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("studentName course rollNumber payments totalFees paidAmount dueAmount status")
        .lean();

      const recentTransactions = [];
      feesWithPayments.forEach((f) => {
        if (Array.isArray(f.payments)) {
          f.payments.forEach((p) => {
            recentTransactions.push({
              feeId: f._id,
              receiptNo: p.receiptNo || "N/A",
              studentName: f.studentName,
              course: f.course || "General",
              amount: p.amount || 0,
              paymentDate: p.paymentDate,
              paymentMode: p.paymentMode || "Cash",
              transactionId: p.transactionId || "",
              balance: p.balance !== undefined ? p.balance : f.dueAmount,
              status: f.status
            });
          });
        }
      });

      recentTransactions.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      const totalTxAgg = await feesModel.aggregate([
        { $unwind: "$payments" },
        { $count: "count" }
      ]);
      const totalTransactions = totalTxAgg[0]?.count || 0;

      const [totalAdmissions, pendingAdmissions, approvedAdmissions] = await Promise.all([
        admissionModel.countDocuments(),
        admissionModel.countDocuments({ status: "Pending" }),
        admissionModel.countDocuments({ status: "approved" })
      ]);

      return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "Accountant Dashboard statistics fetched successfully",
        data: {
          role: "accountant",
          roleTitle: "Accountant / Finance Officer",
          fees: {
            totalFees: feeTotals.totalFees,
            paidAmount: feeTotals.paidAmount,
            dueAmount: feeTotals.dueAmount,
            discount: feeTotals.discount,
            totalRecords: feeTotals.totalRecords,
            paidRecords: paidFeeRecords,
            partialRecords: partialFeeRecords,
            pendingRecords: pendingFeeRecords,
            collectionRate,
            totalTransactions
          },
          recentTransactions: recentTransactions.slice(0, 8),
          admissions: {
            total: totalAdmissions,
            pending: pendingAdmissions,
            approved: approvedAdmissions
          }
        }
      });
    }

    // =========================================================================
    // 4. ADMIN DASHBOARD (Default & Fallback)
    // Complete institution-wide overview with all administrative metrics.
    // =========================================================================
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalFaculty,
      activeFaculty,
      totalCourses,
      activeCourses,
      totalBatches,
      activeBatches,
      totalDepartments
    ] = await Promise.all([
      studentModel.countDocuments({ status: { $ne: "Deleted" } }),
      studentModel.countDocuments({ status: "Active" }),
      studentModel.countDocuments({ status: "Inactive" }),
      facultyModel.countDocuments(),
      facultyModel.countDocuments({ status: "Active" }),
      courseModel.countDocuments(),
      courseModel.countDocuments({ status: "Active" }),
      batchModel.countDocuments(),
      batchModel.countDocuments({ status: true }),
      departmentModel.countDocuments()
    ]);

    const [
      totalAdmissions,
      pendingAdmissions,
      approvedAdmissions,
      rejectedAdmissions
    ] = await Promise.all([
      admissionModel.countDocuments(),
      admissionModel.countDocuments({ status: "Pending" }),
      admissionModel.countDocuments({ status: "approved" }),
      admissionModel.countDocuments({ status: "rejected" })
    ]);

    const feeAgg = await feesModel.aggregate([
      {
        $group: {
          _id: null,
          totalFees: { $sum: "$totalFees" },
          paidAmount: { $sum: "$paidAmount" },
          dueAmount: { $sum: "$dueAmount" },
          discount: { $sum: "$discount" },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    const feeTotals = feeAgg[0] || {
      totalFees: 0,
      paidAmount: 0,
      dueAmount: 0,
      discount: 0,
      totalRecords: 0
    };

    const [paidFeeRecords, partialFeeRecords, pendingFeeRecords] = await Promise.all([
      feesModel.countDocuments({ status: "Paid" }),
      feesModel.countDocuments({ status: "Partial" }),
      feesModel.countDocuments({ status: "Pending" })
    ]);

    const collectionRate =
      feeTotals.totalFees > 0
        ? Number(((feeTotals.paidAmount / feeTotals.totalFees) * 100).toFixed(1))
        : 0;

    const courseDistAgg = await studentModel.aggregate([
      {
        $match: { status: { $ne: "Deleted" } }
      },
      {
        $group: {
          _id: { $ifNull: ["$Course", "General"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const courseDistribution = courseDistAgg.map((item) => ({
      courseName: item._id || "General",
      count: item.count,
      percentage: totalStudents > 0 ? Number(((item.count / totalStudents) * 100).toFixed(1)) : 0
    }));

    const recentAdmissions = await admissionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("studentName courseName session admissionDate status email mobile createdAt")
      .lean();

    const recentStudents = await studentModel
      .find({ status: { $ne: "Deleted" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("batch", "batchName")
      .select("StudentName email rollNumber Course semester status createdAt")
      .lean();

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Admin Dashboard statistics fetched successfully",
      data: {
        role: "admin",
        roleTitle: "Administrator",
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents
        },
        faculty: {
          total: totalFaculty,
          active: activeFaculty
        },
        courses: {
          total: totalCourses,
          active: activeCourses
        },
        batches: {
          total: totalBatches,
          active: activeBatches
        },
        departments: {
          total: totalDepartments
        },
        fees: {
          totalFees: feeTotals.totalFees,
          paidAmount: feeTotals.paidAmount,
          dueAmount: feeTotals.dueAmount,
          discount: feeTotals.discount,
          totalRecords: feeTotals.totalRecords,
          paidRecords: paidFeeRecords,
          partialRecords: partialFeeRecords,
          pendingRecords: pendingFeeRecords,
          collectionRate
        },
        admissions: {
          total: totalAdmissions,
          pending: pendingAdmissions,
          approved: approvedAdmissions,
          rejected: rejectedAdmissions
        },
        courseDistribution,
        recentAdmissions,
        recentStudents
      }
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: error.message || "Failed to fetch dashboard statistics"
    });
  }
};

module.exports = {
  getDashboardStats
};
