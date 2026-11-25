const express = require("express");
const staticPageRouter = express.Router();

const controller = require("../../controller/Fronted/staticpageController");

staticPageRouter.get("/viewall", controller.viewAllStaticPage);
staticPageRouter.get("/find/:slug", controller.findStaticPageBySlug);

module.exports = staticPageRouter;