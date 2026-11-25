const express = require("express");
const router = express.Router();

const dashboardController = require("../../controller/Admin/dashboardController");

// Dashboard statistics routes
router.get("/", dashboardController.getDashboardStats);
router.get("/stats", dashboardController.getDashboardStats);

module.exports = router;
