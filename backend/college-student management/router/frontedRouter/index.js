const express = require("express")
const router = express.Router()


const homerouter = require("./homeRouter")
const courserouter = require("./courseRouter")
const facultyrouter = require("./facultyRouter")
const aboutRouter = require("./aboutRouter")
const departmentrouter = require("./departmentRouter")
const admissionrouter = require("./admissionRouter")
const placementrouter = require("./placementRouter")
const contactrouter = require("./contactRouter")
const staticpageRouter = require("./staticpageRouter")
const registerrouter = require("./registerRouter")
const eventrouter = require("./eventRouter")
const faqrouter = require("./faqRouter")
const noticerouter = require("./noticeRouter")
const examrouter = require("./examRouter")
const batchrouter = require("./batchRouter")
const memoriesrouter = require("./memoriesRouter")



router.use("/home", homerouter)
router.use("/course", courserouter)
router.use("/faculty", facultyrouter)
router.use("/about", aboutRouter)
router.use("/department", departmentrouter)
router.use("/admission", admissionrouter)
router.use("/placement", placementrouter)
router.use("/contact", contactrouter)
router.use("/staticpage", staticpageRouter)
router.use("/static", staticpageRouter)
router.use("/auth", registerrouter)
router.use("/event",eventrouter)
router.use("/faq",faqrouter)
router.use("/notice",noticerouter)
router.use("/exam", examrouter)
router.use("/batch",batchrouter)
router.use("/memories", memoriesrouter)


module.exports = router