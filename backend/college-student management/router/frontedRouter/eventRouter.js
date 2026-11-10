const express = require("express");
const eventrouter = express.Router();

const eventcontroller = require("../../controller/Fronted/eventController");

// View All Events
eventrouter.get("/list", eventcontroller.getAllEvent);

// View Event By Id
eventrouter.get("/details/:id", eventcontroller.getEventById);

module.exports = eventrouter;