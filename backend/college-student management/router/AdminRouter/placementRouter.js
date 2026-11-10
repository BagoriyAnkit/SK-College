const express = require("express")
const placementrouter = express.Router()


const placementController = require("../../controller/Admin/placementController")
const placementValidation = require("../../validation/adminValidation/placementValidation")
const validate = require("../../middleware/validate")


placementrouter.post("/add", validate(placementValidation), placementController.addPlacement)
placementrouter.get("/viewAll", placementController.getPlacements)
placementrouter.get("/findOne/:id", placementController.findOnePlacement);
placementrouter.put("/update/:id", placementController.updatePlacement)
placementrouter.delete("/delete/:id", placementController.deletePlacement)


module.exports = placementrouter