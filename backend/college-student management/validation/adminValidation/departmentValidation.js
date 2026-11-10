const Joi = require("joi");

const departmentValidation = Joi.object({
  DepartmentName: Joi.string().required(),
  DepartmentCode: Joi.string().required(),
  HOD: Joi.string().allow("", null),
  hod: Joi.string().allow("", null),
  hodId: Joi.string().allow("", null),
  Description: Joi.string().allow("", null),
  Status: Joi.boolean()
});

module.exports = departmentValidation;
