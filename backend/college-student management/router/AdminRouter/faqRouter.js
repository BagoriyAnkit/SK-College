const express = require("express");
const faqRouter = express.Router();

const controller = require("../../controller/Admin/faqController");
const faqValidation = require("../../validation/adminValidation/faqValidation");
const validate = require("../../middleware/validate");

faqRouter.get("/viewAll", controller.viewAllFaq);

faqRouter.post("/add", validate(faqValidation), controller.addFaq);

faqRouter.get("/find/:id", controller.findFaq);

faqRouter.put("/update/:id", controller.updateFaq);

faqRouter.patch("/status/:id", controller.updateFaqStatus);

faqRouter.delete("/delete/:id", controller.deleteFaq);

module.exports = faqRouter;