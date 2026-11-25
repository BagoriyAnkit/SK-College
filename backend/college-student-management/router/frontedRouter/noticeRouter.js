const express = require("express");
const router = express.Router();

const {
    viewAllNotice,
    findOneNotice,
} = require("../../controller/Fronted/noticeController");

router.get("/list", viewAllNotice);
router.get("/details/:id", findOneNotice);

module.exports = router;