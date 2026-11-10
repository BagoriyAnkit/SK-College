const joi = require('joi');

const courseValidation = joi.object({
  courseName: joi.string().required(),
  courseCode: joi.string().required(),
  department: joi.string().allow("", null),
  departmentId: joi.string().allow("", null),
  duration: joi.string().required(),
  totalSemester: joi.alternatives().try(joi.number(), joi.string()).required(),
  courseType: joi.string().allow("", null),
  description: joi.string().allow("", null),
  status: joi.string().allow("", null)
});

module.exports = courseValidation;
