const express = require("express");
const router = express.Router();

const userRouter = require("./userRouter");
const studentrouter = require("./studentRouter");
const courserouter = require("./courseRouter");
const facultyrouter = require("./facultyRouter");
const batchrouter = require("./batchRouter");
const feesrouter = require("./feesRouter");
const eventrouter = require("./eventRouter");
const examrouter = require("./examRouter");
const noticerouter = require("./noticeRouter");
const admissionrouter = require("./admissionRouter");
const placementrouter = require("./placementRouter");
const contactrouter = require("./contactRouter");
const staticPageRouter = require("./staticpageRouter");
const faqRouter = require("./faqRouter");
const aboutRouter = require("./aboutRouter");
const memoriesRouter = require("./memoriesRouter");
const departmentrouter = require("./departmentRouter");
const dashboardrouter = require("./dashboardRouter");
const { verifyToken, verifyAdmin, authorizeRoles } = require("../../middleware/veriifyToken");
const { adminLogin } = require("../../controller/Admin/userController");

// Public admin login routes
router.post("/login", adminLogin);
router.post("/user/login", adminLogin);

// Protected routes require valid authentication token
router.use(verifyToken);

// 0. Dashboard Statistics: Admin, HOD, Teacher, Accountant
router.use("/dashboard", authorizeRoles("admin", "hod", "teacher", "accountant"), dashboardrouter);

// 1. User Account Management: Admin only
router.use("/user", authorizeRoles("admin"), userRouter);

// 2. Student Records: Admin, HOD, Teacher, Accountant
router.use("/student", authorizeRoles("admin", "hod", "teacher", "accountant"), studentrouter);
router.use("/Student", authorizeRoles("admin", "hod", "teacher", "accountant"), studentrouter);

// 3. Courses: Admin, HOD, Teacher, Accountant, Student
router.use("/course", authorizeRoles("admin", "hod", "teacher", "accountant", "student"), courserouter);

// 4. Faculty / Teachers: Admin, HOD, Teacher
router.use("/Teacher", authorizeRoles("admin", "hod", "teacher"), facultyrouter);
router.use("/teacher", authorizeRoles("admin", "hod", "teacher"), facultyrouter);
router.use("/faculty", authorizeRoles("admin", "hod", "teacher"), facultyrouter);

// 5. Batches: Admin, HOD, Teacher, Accountant
router.use("/batch", authorizeRoles("admin", "hod", "teacher", "accountant"), batchrouter);

// 6. Fees Management: Admin, Accountant only
router.use("/Fees", authorizeRoles("admin", "accountant"), feesrouter);
router.use("/fees", authorizeRoles("admin", "accountant"), feesrouter);

// 7. Event Management: Admin, HOD
router.use("/event", authorizeRoles("admin", "hod"), eventrouter);

// 8. Exam & Marks Management: Admin, HOD, Teacher, Student
router.use("/exam", authorizeRoles("admin", "hod", "teacher", "student"), examrouter);
router.use("/marks", authorizeRoles("admin", "hod", "teacher", "student"), examrouter);

// 9. Notices: Admin, HOD, Teacher, Student, Accountant
router.use("/notice", authorizeRoles("admin", "hod", "teacher", "student", "accountant"), noticerouter);

// 10. Admission Management: Admin, HOD, Accountant
router.use("/admission", authorizeRoles("admin", "hod", "accountant"), admissionrouter);

// 11. Placement Management: Admin, HOD
router.use("/placement", authorizeRoles("admin", "hod"), placementrouter);

// 12. Department Management: Admin, HOD, Teacher, Accountant
router.use("/department", authorizeRoles("admin", "hod", "teacher", "accountant"), departmentrouter);

// 13. System CMS, Settings & Inquiries: Admin only
router.use("/contact", authorizeRoles("admin"), contactrouter);
router.use("/staticpage", authorizeRoles("admin"), staticPageRouter);
router.use("/static", authorizeRoles("admin"), staticPageRouter);
router.use("/faq", authorizeRoles("admin"), faqRouter);
router.use("/about", authorizeRoles("admin"), aboutRouter);
router.use("/memories", authorizeRoles("admin"), memoriesRouter);

module.exports = router;
