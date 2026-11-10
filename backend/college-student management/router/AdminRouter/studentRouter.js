const express = require("express")
const studentrouter = express.Router()

const controller = require("../../controller/Admin/studentController")
const studentValidation = require("../../validation/adminValidation/studentValidation")
const validate = require("../../middleware/validate")
const upload = require("../../middleware/upload")


const { authorizeRoles } = require("../../middleware/veriifyToken")

studentrouter.post("/add", authorizeRoles("admin", "hod"), upload.single("image"), validate(studentValidation), controller.addStudent);
studentrouter.get("/findstudent/:id", controller.findStudent);
studentrouter.get("/find/:id", controller.findStudent);
studentrouter.put("/updatestudent/:id", authorizeRoles("admin", "hod"), validate(studentValidation), controller.updateStudent);
studentrouter.put("/update/:id", authorizeRoles("admin", "hod"), validate(studentValidation), controller.updateStudent);
studentrouter.delete("/deletestudent/:id", authorizeRoles("admin"), controller.deleteStudent);
studentrouter.delete("/delete/:id", authorizeRoles("admin"), controller.deleteStudent);
studentrouter.get("/viewall", controller.viewAllStudent);
studentrouter.get("/viewAll", controller.viewAllStudent);
studentrouter.patch("/status/:id", authorizeRoles("admin", "hod"), controller.updateStatus);
studentrouter.post("/link", authorizeRoles("admin", "hod"), controller.linkAccount);
studentrouter.post("/unlink/:id", authorizeRoles("admin", "hod"), controller.unlinkAccount);
studentrouter.get("/link-status/:id", controller.getLinkStatus);

module.exports = studentrouter;