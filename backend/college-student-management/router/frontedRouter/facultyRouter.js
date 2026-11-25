const express = require("express")
const facultyrouter = express.Router()


const facultycontroller = require("../../controller/Fronted/facultyController")



facultyrouter.get("/list", facultycontroller.getAllFaculty);

facultyrouter.get("/details/:id", facultycontroller.getFacultyById);

module.exports = facultyrouter;