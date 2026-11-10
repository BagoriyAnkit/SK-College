const joi = require("joi");

const registerValidation = joi.object({
    full_name: joi.string().required(),
    email: joi.string().required(),
    mobile_no: joi.number().required(),
    course: joi.string().required(),
});

const loginValidation = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
});

const forgotPasswordValidation = joi.object({
    email: joi.string().email().required(),
});

const resetPasswordValidation = joi.object({
    password: joi.string().min(6).required(),
    confirmPassword: joi.string().optional(),
});

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
};
