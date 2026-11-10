const express = require("express")
const courserouter = express.Router()


const coursecontroller = require("../../controller/Fronted/courseController")



courserouter.get("/list",coursecontroller.getAllCourse)
courserouter.get("/details/:id", coursecontroller.getCourseById)



module.exports = courserouter