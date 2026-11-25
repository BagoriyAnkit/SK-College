const express = require("express");
const memoriesRouter = express.Router();

const upload = require("../../middleware/upload");
const validate = require("../../middleware/validate");

const memoriesValidation = require("../../validation/adminValidation/memoriesValidation");
const memoriesController = require("../../controller/Admin/memoriesController");
memoriesRouter.post(
  "/add",
  upload.single("image"),
  validate(memoriesValidation),
  memoriesController.addMemories
);

memoriesRouter.get(
  "/viewall",
  memoriesController.viewAllMemories
);

memoriesRouter.get(
  "/find/:id",
  memoriesController.findMemories
);

memoriesRouter.put(
  "/update/:id",
  upload.single("image"),
  memoriesController.updateMemories
);

memoriesRouter.delete(
  "/delete/:id",
  memoriesController.deleteMemories
);

module.exports = memoriesRouter;