const express = require("express")
const noticerouter = express.Router()

const noticecontroller = require("../../controller/Admin/noticeController")
const noticeValidation = require("../../validation/adminValidation/noticeValidation")
const validate = require("../../middleware/validate")


const { authorizeRoles } = require("../../middleware/veriifyToken")

noticerouter.post("/add", authorizeRoles("admin", "hod"), validate(noticeValidation), noticecontroller.addNotice)
noticerouter.get("/find/:id", noticecontroller.findNotice)
noticerouter.put("/update/:id", authorizeRoles("admin", "hod"), noticecontroller.updateNotice)
noticerouter.delete("/delete/:id", authorizeRoles("admin"), noticecontroller.deleteNotice)
noticerouter.get("/viewAll", noticecontroller.viewAllNotice)




module.exports = noticerouter