const express = require("express");

const router = express.Router();

const memoriesController = require("../../controller/Fronted/memoriesController");


router.get(
    "/viewall",
    memoriesController.viewAllMemories
);


module.exports = router;