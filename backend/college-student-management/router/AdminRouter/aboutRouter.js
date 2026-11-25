const express = require("express");
const aboutRouter = express.Router();

const upload = require("../../middleware/upload");
const validate = require("../../middleware/validate");

const aboutController = require("../../controller/Admin/aboutController");
const { aboutValidation } = require("../../validation/adminValidation/aboutValidation");

aboutRouter.post( "/add",upload.single("image"), validate(aboutValidation), aboutController.addAbout
);

aboutRouter.get( "/view",aboutController.viewAbout
);

aboutRouter.put( "/update/:id", upload.single("image"), validate(aboutValidation), aboutController.updateAbout);

module.exports = aboutRouter;