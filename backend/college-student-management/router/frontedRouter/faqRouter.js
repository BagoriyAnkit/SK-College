const express = require("express");
const router = express.Router();

const {
    viewAllFaq,
    findOneFaq,
} = require("../../controller/Fronted/faqController");

router.get("/list", viewAllFaq);
router.get("/details/:id", findOneFaq);

module.exports = router;