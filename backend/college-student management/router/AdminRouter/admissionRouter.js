const express = require("express");
const admissionrouter = express.Router();

const admissioncontroller = require("../../controller/Admin/admissionController");
const admissionValidation = require("../../validation/adminValidation/admissionValidation");
const validate = require("../../middleware/validate");
const upload = require("../../middleware/upload");
const { authorizeRoles } = require("../../middleware/veriifyToken");

// Create direct admission
admissionrouter.post(
    "/add",
    authorizeRoles("admin", "hod"),
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "signature", maxCount: 1 },
        { name: "marksheet", maxCount: 1 },
    ]),
    admissioncontroller.addAdmission
);

admissionrouter.post(
    "/addadmission",
    authorizeRoles("admin", "hod"),
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "signature", maxCount: 1 },
        { name: "marksheet", maxCount: 1 },
    ]),
    admissioncontroller.addAdmission
);

// View admissions
admissionrouter.get("/find/:id", admissioncontroller.findAdmission);
admissionrouter.get("/ViewAll", admissioncontroller.findAllAdmission);
admissionrouter.get("/viewall", admissioncontroller.findAllAdmission);

// Update admission details
admissionrouter.put(
    "/updateadmission/:id",
    authorizeRoles("admin", "hod"),
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "signature", maxCount: 1 },
        { name: "marksheet", maxCount: 1 }
    ]),
    admissioncontroller.updateAdmission
);

// Approve application (creates student, user, links reciprocally, sets activation token)
admissionrouter.put("/approve/:id", authorizeRoles("admin", "hod"), admissioncontroller.approveAdmission);
admissionrouter.patch("/approve/:id", authorizeRoles("admin", "hod"), admissioncontroller.approveAdmission);
admissionrouter.post("/approve/:id", authorizeRoles("admin", "hod"), admissioncontroller.approveAdmission);

// Reject application (updates status to rejected, no user or student created)
admissionrouter.put("/reject/:id", authorizeRoles("admin", "hod"), admissioncontroller.rejectAdmission);
admissionrouter.patch("/reject/:id", authorizeRoles("admin", "hod"), admissioncontroller.rejectAdmission);
admissionrouter.post("/reject/:id", authorizeRoles("admin", "hod"), admissioncontroller.rejectAdmission);

// Status and delete
admissionrouter.patch("/status/:id", authorizeRoles("admin", "hod"), admissioncontroller.updateStatus);
admissionrouter.delete("/delete/:id", authorizeRoles("admin"), admissioncontroller.deleteAdmission);

module.exports = admissionrouter;
