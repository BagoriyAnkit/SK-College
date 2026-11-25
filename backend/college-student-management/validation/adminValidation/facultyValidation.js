const joi = require("joi");

const facultyValidation = joi.object({
  TeacherName: joi.string().required(),
  Email: joi.string().required(),
  PhoneNumber: joi.alternatives().try(joi.number(), joi.string()).required(),
  Department: joi.string().allow("", null),
  department: joi.string().allow("", null),
  departmentId: joi.string().allow("", null),
  Qualification: joi.string().required(),
  Experience: joi.string().required(),
  gender: joi.string().required(),
  status: joi.string().allow("", null),
  userId: joi.string().allow("", null)
});

const updateFacultyValidation = joi.object({
  TeacherName: joi.string().allow("", null),
  Email: joi.string().allow("", null),
  PhoneNumber: joi.alternatives().try(joi.number(), joi.string()).allow("", null),
  Department: joi.string().allow("", null),
  department: joi.string().allow("", null),
  departmentId: joi.string().allow("", null),
  Qualification: joi.string().allow("", null),
  Experience: joi.string().allow("", null),
  gender: joi.string().allow("", null),
  status: joi.string().allow("", null),
  userId: joi.string().allow("", null)
});

module.exports = facultyValidation;
module.exports.facultyValidation = facultyValidation;
module.exports.updateFacultyValidation = updateFacultyValidation;
