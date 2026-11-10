const express = require("express");
const registerrouter = express.Router();

const registercontroller = require("../../controller/Fronted/registercontroller");
const { registerValidation, loginValidation } = require("../../validation/frontedValidation/registerValidation");

const validate = require("../../middleware/validate");

const Tokenverify = require("../../middleware/veriifyToken");

registerrouter.post("/register", validate(registerValidation), registercontroller.register);
registerrouter.post("/login", validate(loginValidation), registercontroller.login);

// Password Reset Flow
registerrouter.post("/forgot-password", registercontroller.forgotPassword);
registerrouter.get("/verify-reset-token/:token", registercontroller.verifyResetToken);
registerrouter.post("/reset-password/:token", registercontroller.resetPassword);
registerrouter.post("/reset-password", registercontroller.resetPassword);

module.exports = registerrouter;
