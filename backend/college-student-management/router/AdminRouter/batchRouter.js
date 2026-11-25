const express = require("express");
const batchrouter = express.Router();

const Batchcontroller = require("../../controller/Admin/batchController");
const validate = require("../../middleware/validate");
const { BatchValidation, updateBatchValidation } = require("../../validation/adminValidation/batchValidation");
const { authorizeRoles } = require("../../middleware/veriifyToken");

batchrouter.get("/viewAll", Batchcontroller.viewAll);
batchrouter.get("/viewall", Batchcontroller.viewAll);
batchrouter.post("/add", authorizeRoles("admin", "hod"), validate(BatchValidation), Batchcontroller.addBatch);
batchrouter.get("/find/:id", Batchcontroller.findBatch);
batchrouter.put("/update/:id", authorizeRoles("admin", "hod"), validate(updateBatchValidation || BatchValidation), Batchcontroller.updateBatch);
batchrouter.delete("/delete/:id", authorizeRoles("admin"), Batchcontroller.deleteBatch);

// Support both PATCH and PUT for batch status update to ensure frontend-backend consistency
batchrouter.patch("/status/:id", authorizeRoles("admin", "hod"), Batchcontroller.updateStatus);
batchrouter.put("/status/:id", authorizeRoles("admin", "hod"), Batchcontroller.updateStatus);

module.exports = batchrouter;
