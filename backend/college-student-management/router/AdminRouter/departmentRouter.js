const express = require("express");
const router = express.Router();

const departmentController = require("../../controller/Admin/departmentController");

const { authorizeRoles } = require("../../middleware/veriifyToken");

router.post("/add", authorizeRoles("admin", "hod"), departmentController.addDepartment);

router.get("/viewall", departmentController.viewAllDepartment);

router.get("/findOne/:id", departmentController.findDepartment);

router.put("/update/:id", authorizeRoles("admin", "hod"), departmentController.updateDepartment);

router.delete("/delete/:id", authorizeRoles("admin"), departmentController.deleteDepartment);

router.patch("/update-status/:id", authorizeRoles("admin", "hod"), departmentController.updateStatus);

module.exports = router;