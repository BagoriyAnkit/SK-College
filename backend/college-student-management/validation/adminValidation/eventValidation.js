const joi = require("joi");

const eventValidation = joi.object({
  event_title: joi.string().required(),
  description: joi.string().optional().allow("", null),
  event_date: joi.date().required(),
  start_time: joi.string().required(),
  end_time: joi.string().required(),
  location: joi.string().required(),
  image: joi.any().optional().allow("", null),
  status: joi.alternatives().try(joi.boolean(), joi.string()).optional()
}).unknown(true);

const updateValidation = joi.object({
  event_title: joi.string().optional().allow("", null),
  description: joi.string().optional().allow("", null),
  event_date: joi.date().optional(),
  start_time: joi.string().optional().allow("", null),
  end_time: joi.string().optional().allow("", null),
  location: joi.string().optional().allow("", null),
  image: joi.any().optional().allow("", null),
  status: joi.alternatives().try(joi.boolean(), joi.string()).optional()
}).unknown(true);

module.exports = { eventValidation, updateValidation };
