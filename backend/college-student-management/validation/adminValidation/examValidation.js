const joi = require("joi");

const examValidation = joi
  .object({
    examName: joi.string().optional().trim(),
    ExamName: joi.string().optional().trim(),
    examType: joi.string().optional().allow("", null),
    course: joi.string().optional().allow("", null),
    courseId: joi.string().optional().allow("", null),
    courseName: joi.string().optional().allow("", null),
    batch: joi.string().optional().allow("", null),
    batchId: joi.string().optional().allow("", null),
    batchName: joi.string().optional().allow("", null),
    ClassId: joi.string().optional().allow("", null),
    subject: joi.string().required().trim(),
    examDate: joi.any().optional(),
    StartDate: joi.any().optional(),
    EndDate: joi.any().optional(),
    maxMarks: joi.number().min(1).optional(),
    MaxMarks: joi.number().min(1).optional(),
    minMarks: joi.number().min(0).optional(),
    MinMarks: joi.number().min(0).optional(),
    academicYear: joi.string().optional().allow("", null),
    AcademicYear: joi.string().optional().allow("", null),
    status: joi.string().optional().allow("", null)
  })
  .or("examName", "ExamName")
  .or("maxMarks", "MaxMarks");

const marksValidation = joi
  .object({
    exam: joi.string().optional().allow("", null),
    examId: joi.string().optional().allow("", null),
    student: joi.string().optional().allow("", null),
    studentId: joi.string().optional().allow("", null),
    studentName: joi.string().optional().allow("", null),
    rollNumber: joi.string().optional().allow("", null),
    marksObtained: joi.number().min(0).required(),
    maxMarks: joi.number().min(1).optional(),
    remarks: joi.string().optional().allow("", null)
  })
  .or("student", "studentId", "studentName");

examValidation.examValidation = examValidation;
examValidation.marksValidation = marksValidation;

module.exports = examValidation;
