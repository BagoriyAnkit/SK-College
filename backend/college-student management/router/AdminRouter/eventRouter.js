const express = require("express")
const eventRouter = express.Router()

const eventController = require("../../controller/Admin/eventController")
const { eventValidation, updateValidation } = require("../../validation/adminValidation/eventValidation")
const validate = require("../../middleware/validate")
const upload = require("../../middleware/upload");

eventRouter.post("/add", upload.single("image"), validate(eventValidation), eventController.addEvent)
eventRouter.get("/view/:id", eventController.viewEvent)
eventRouter.put("/update/:id", validate(updateValidation), eventController.updateEvent)
eventRouter.put("/updateStatus/:id", eventController.updateStatus)
eventRouter.delete("/delete/:id", eventController.deleteEvent)
eventRouter.get("/viewall", eventController.viewAllEvent)




module.exports = eventRouter