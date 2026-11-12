const joi = require("joi");

const noticeValidation = joi.object({
  notice_title: joi.string().required(),
  description: joi.string().required(),
  department: joi.string().optional().allow("", null),
  issued_by: joi.string().optional().allow("", null),
  publish_date: joi.date().optional(),
  for_whom: joi.string().optional().allow("", null)
}).unknown(true);

module.exports = noticeValidation;