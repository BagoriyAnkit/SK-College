const express = require("express");
const examrouter = express.Router();

const examcontroller = require("../../controller/Admin/examController");
const examValidation = require("../../validation/adminValidation/examValidation");
const validate = require("../../middleware/validate");

const { authorizeRoles } = require("../../middleware/veriifyToken");

// Exam CRUD routes
examrouter.post("/add", authorizeRoles("admin", "hod", "teacher"), validate(examValidation), examcontroller.addExam);
examrouter.get("/find/:id", examcontroller.findExam);
examrouter.put("/update/:id", authorizeRoles("admin", "hod", "teacher"), examcontroller.updateExam);
examrouter.delete("/delete/:id", authorizeRoles("admin", "hod"), examcontroller.deleteExam);
examrouter.get("/viewall", examcontroller.viewAllExam);

// Marks Management routes
examrouter.post("/:id/marks", authorizeRoles("admin", "hod", "teacher"), examcontroller.addMarks);
examrouter.post("/marks/add", authorizeRoles("admin", "hod", "teacher"), examcontroller.addMarks);
examrouter.get("/:id/marks", examcontroller.getExamMarks);
examrouter.get("/marks/:id", examcontroller.getExamMarks);
examrouter.put("/:id/marks/:marksId", authorizeRoles("admin", "hod", "teacher"), examcontroller.updateMarks);
examrouter.put("/marks/update/:marksId", authorizeRoles("admin", "hod", "teacher"), examcontroller.updateMarks);
examrouter.delete("/:id/marks/:marksId", authorizeRoles("admin", "hod"), examcontroller.deleteMarks);
examrouter.delete("/marks/delete/:marksId", authorizeRoles("admin", "hod"), examcontroller.deleteMarks);
examrouter.get("/student/:studentId/marks", examcontroller.getStudentMarks);

// Results & Marksheet routes
examrouter.get("/batch/:batchId/results", examcontroller.getBatchResults);
examrouter.get("/results/batch/:batchId", examcontroller.getBatchResults);
examrouter.get("/student/:studentId/marksheet", examcontroller.getStudentMarksheet);
examrouter.get("/marksheet/:studentId", examcontroller.getStudentMarksheet);

module.exports = examrouter;
