const express = require("express");
const admissionrouter = express.Router();
const upload = require("../../middleware/upload");

const admissionController = require("../../controller/Fronted/admissionController");

// Public routes for admission inquiries
admissionrouter.post(
    "/apply",
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "signature", maxCount: 1 },
        { name: "marksheet", maxCount: 1 }
    ]),
    admissionController.applyAdmission
);
admissionrouter.get("/list", admissionController.getAdmissions);
admissionrouter.get("/details/:id", admissionController.getAdmissionById);

module.exports = admissionrouter;
