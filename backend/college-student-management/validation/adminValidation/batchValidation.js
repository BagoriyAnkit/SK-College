const joi = require("joi");

const BatchValidation = joi.object({
  batchName: joi.string().required(),
  course: joi.string().allow("", null),
  courseId: joi.string().allow("", null),
  courseName: joi.string().allow("", null),
  session: joi.string().required(),
  strength: joi.alternatives().try(joi.number(), joi.string()).required(),
  classTeacher: joi.string().allow("", null),
  status: joi.boolean().optional()
});

const updateBatchValidation = joi.object({
  batchName: joi.string().allow("", null),
  course: joi.string().allow("", null),
  courseId: joi.string().allow("", null),
  courseName: joi.string().allow("", null),
  session: joi.string().allow("", null),
  strength: joi.alternatives().try(joi.number(), joi.string()).allow("", null),
  classTeacher: joi.string().allow("", null),
  status: joi.boolean().optional()
});

module.exports = BatchValidation;
module.exports.BatchValidation = BatchValidation;
module.exports.updateBatchValidation = updateBatchValidation;
