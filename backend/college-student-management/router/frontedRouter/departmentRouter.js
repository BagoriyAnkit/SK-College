const express = require("express");
const router = express.Router();

const departmentController = require("../../controller/Fronted/departmentController");

router.get("/list", departmentController.viewAllDepartment);

router.get("/details/:id", departmentController.findOneDepartment);

module.exports = router;