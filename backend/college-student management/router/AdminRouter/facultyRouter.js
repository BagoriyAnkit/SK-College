const express = require("express");
const facultyrouter = express.Router();

const facultycontroller = require("../../controller/Admin/facultyController");
const validate = require("../../middleware/validate");
const { facultyValidation, updateFacultyValidation } = require("../../validation/adminValidation/facultyValidation");

const { authorizeRoles } = require("../../middleware/veriifyToken");

facultyrouter.post("/add", authorizeRoles("admin", "hod"), validate(facultyValidation), facultycontroller.addfaculty);
facultyrouter.get("/findOne/:id", facultycontroller.findFaculty);
facultyrouter.put("/update/:id", authorizeRoles("admin", "hod"), validate(updateFacultyValidation || facultyValidation), facultycontroller.updateFaculty);
facultyrouter.delete("/delete/:id", authorizeRoles("admin"), facultycontroller.deleteFaculty);
facultyrouter.get("/viewAll", facultycontroller.viewAllFaculty);
facultyrouter.patch("/status/:id", authorizeRoles("admin", "hod"), facultycontroller.updateStatus);
facultyrouter.post("/link", authorizeRoles("admin", "hod"), facultycontroller.linkAccount);
facultyrouter.post("/unlink/:id", authorizeRoles("admin", "hod"), facultycontroller.unlinkAccount);
facultyrouter.get("/link-status/:id", facultycontroller.getLinkStatus);

module.exports = facultyrouter;
