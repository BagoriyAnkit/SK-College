const express = require("express");
const router = express.Router();

const contactController = require("../../controller/Fronted/contactController");
const validate = require("../../middleware/validate");
const contactValidation = require("../../validation/frontedValidation/contactValidation");

router.post("/add", validate(contactValidation), contactController.addContact);

module.exports = router;