const Joi = require("joi");

const faqValidation = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
});

module.exports = faqValidation;