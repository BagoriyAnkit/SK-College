const joi = require("joi");

const feesValidation = joi.object({
  studentId: joi.string().optional().allow("", null),
  studentName: joi.string().optional().allow("", null),
  courseName: joi.string().required(),
  courseId: joi.string().optional().allow("", null),
  totalFees: joi.number().min(0).required(),
  paidAmount: joi.number().min(0).required(),
  dueAmount: joi.number().optional().allow(null),
  discount: joi.number().min(0).optional().default(0),
  paymentDate: joi.any().optional(),
  paymentMode: joi.string().optional().allow("", null),
  transactionId: joi.string().optional().allow("", null),
  receiptNo: joi.string().optional().allow("", null),
  balance: joi.number().optional().allow(null),
  remarks: joi.string().optional().allow("", null),
  paidBy: joi.string().optional().allow("", null),
  status: joi.string().optional().allow("", null)
}).or("studentId", "studentName");

module.exports = feesValidation;
