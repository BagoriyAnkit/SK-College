const express = require("express");
const feesrouter = express.Router();

const feescontroller = require("../../controller/Admin/feesController");
const feesValidation = require("../../validation/adminValidation/feesValidation");
const validate = require("../../middleware/validate");

const { authorizeRoles } = require("../../middleware/veriifyToken");

feesrouter.post("/add", validate(feesValidation), feescontroller.addFees);
feesrouter.post("/pay/:id", feescontroller.addPaymentInstallment);
feesrouter.post("/payment/:id", feescontroller.addPaymentInstallment);
feesrouter.post("/:id/payment", feescontroller.addPaymentInstallment);

feesrouter.get("/viewAll", feescontroller.viewAllFees);
feesrouter.put("/updatefees/:id", feescontroller.updateFees);
feesrouter.delete("/delete/:id", authorizeRoles("admin"), feescontroller.deletefees);
feesrouter.get("/receipt/:receiptNo", feescontroller.getReceiptByNumber);
feesrouter.get("/:id/receipt/:paymentId", feescontroller.getPaymentReceipt);
feesrouter.get("/find/:id", feescontroller.findOneFees);

module.exports = feesrouter;
