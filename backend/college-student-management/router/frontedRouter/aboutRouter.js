// const express = require("express")
// const aboutrouter = express.Router()

// const aboutcontroller = require("../../controller/Fronted/aboutController")


// aboutrouter.get("/aboutus", aboutcontroller.getAboutData)



// module.exports = aboutrouter

const express = require("express");
const aboutRouter = express.Router();

const aboutController = require("../../controller/Fronted/aboutController");

aboutRouter.get("/view", aboutController.viewAbout);

module.exports = aboutRouter;