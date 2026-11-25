const express = require("express");
const staticPageRouter = express.Router();

const controller = require("../../controller/Admin/staticpageController");
const staticPageValidation = require("../../validation/adminValidation/staticpageValidation");
const validate = require("../../middleware/validate");
const upload = require("../../middleware/upload");
staticPageRouter.get("/viewAll", controller.viewAllStaticPage);

staticPageRouter.post("/add", upload.single("image"), validate(staticPageValidation), controller.addStaticPage);
staticPageRouter.get("/find/:id", controller.findStaticPage);
staticPageRouter.get("/:slug", controller.findStaticPageBySlug);
staticPageRouter.put("/update/:id", controller.updateStaticPage);
staticPageRouter.delete("/delete/:id", controller.deleteStaticPage);

module.exports = staticPageRouter;