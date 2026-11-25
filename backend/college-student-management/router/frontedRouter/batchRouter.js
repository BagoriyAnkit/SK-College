const express = require("express");

const batchRouter = express.Router();

const batchController = require("../../controller/Fronted/batchController");


batchRouter.get("/viewall", batchController.viewAllBatch);

batchRouter.get("/find/:id", batchController.findBatch);


module.exports = batchRouter;