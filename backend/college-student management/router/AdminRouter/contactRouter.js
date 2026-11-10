const express = require("express");
const contactrouter = express.Router();

const contactController = require("../../controller/Admin/contactController");

contactrouter.delete("/delete/:id", contactController.deleteContact);
contactrouter.get("/viewAll", contactController.viewAllContact);

module.exports = contactrouter;