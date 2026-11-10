const joi = require("joi");

const studentValidation = joi.object({
  StudentName: joi.string().required(),
  email: joi.string().email().required(),
  Phonenumber: joi.any().required(),
  Course: joi.string().required(),
  address: joi.string().required(),
  dob: joi.any().required(),

  // Extended Student details
  rollNumber: joi.string().optional().allow("", null),
  RollNumber: joi.string().optional().allow("", null),
  semester: joi.number().optional().allow("", null),
  Semester: joi.number().optional().allow("", null),
  batch: joi.string().optional().allow("", null),
  batchId: joi.string().optional().allow("", null),
  department: joi.string().optional().allow("", null),
  departmentId: joi.string().optional().allow("", null),
  parentName: joi.string().optional().allow("", null),
  guardianName: joi.string().optional().allow("", null),
  ParentName: joi.string().optional().allow("", null),
  parentContact: joi.any().optional().allow("", null),
  guardianPhone: joi.any().optional().allow("", null),
  ParentContact: joi.any().optional().allow("", null),

  status: joi.string().optional().allow("", null),
  image: joi.any().optional(),
  userId: joi.string().optional().allow("", null)
});

module.exports = studentValidation;
