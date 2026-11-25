const express=require("express")
const courserouter=express.Router();

const coursecontroller=require('../../controller/Admin/courseController')
const validate=require('../../middleware/validate')
const courseValidations=require('../../validation/adminValidation/courseValidation')

const { authorizeRoles } = require('../../middleware/veriifyToken')

courserouter.get("/viewall", coursecontroller.viewAllCourse)
courserouter.post("/add", authorizeRoles("admin", "hod"), validate(courseValidations), coursecontroller.addCourse)
courserouter.put("/update/:id", authorizeRoles("admin", "hod"), coursecontroller.updateCourse)
courserouter.delete("/delete/:id", authorizeRoles("admin"), coursecontroller.deleteCourse)
courserouter.get('/findOne/:id', coursecontroller.findcourse)
courserouter.patch("/status/:id", authorizeRoles("admin", "hod"), coursecontroller.updateStatus);





module.exports=courserouter