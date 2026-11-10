const Joi = require("Joi");

const admissionValidation = Joi.object({
  studentName: Joi.string().required(),
  fatherName: Joi.string().required(),
  motherName: Joi.string().required(),
  session: Joi.string().required(),
  qualification: Joi.string().required(),
  board: Joi.string().required(),
  passingYear: Joi.number().required(),
  percentage: Joi.string().required(),
  aadhaar:Joi.string().required(),

  DOB: Joi.date().required(),
  gender: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  address: Joi.string().required(),
  courseName: Joi.string().required(),
  //  category:Joi.string().required(),
  admissionDate: Joi.date().required(),
})



module.exports = admissionValidation