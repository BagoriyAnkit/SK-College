const Joi = require("joi");

const aboutValidation = Joi.object({
  title: Joi.string().required(),

  description: Joi.string().required(),

  vision: Joi.string().required(),

  mission: Joi.string().required(),
});

module.exports = { aboutValidation };