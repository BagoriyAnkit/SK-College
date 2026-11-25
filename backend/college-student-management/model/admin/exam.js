const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    // Exam Name
    examName: {
      type: String,
      required: true,
      trim: true
    },
    ExamName: {
      type: String,
      trim: true
    },

    // Exam Type (Mid Term, Final, Unit Test, Practical, Semester, Internal)
    examType: {
      type: String,
      default: "Semester",
      trim: true
    },

    // Course Reference
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      default: null
    },
    courseName: {
      type: String,
      default: "",
      trim: true
    },

    // Batch Reference
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null
    },
    batchName: {
      type: String,
      default: "",
      trim: true
    },
    ClassId: {
      type: String,
      default: "",
      trim: true
    },

    // Subject Name / Code
    subject: {
      type: String,
      required: true,
      trim: true
    },

    // Exam Date
    examDate: {
      type: Date,
      default: Date.now
    },
    StartDate: {
      type: Date
    },
    EndDate: {
      type: Date
    },

    // Maximum Marks
    maxMarks: {
      type: Number,
      required: true,
      min: [1, "Maximum marks must be greater than 0"]
    },
    MaxMarks: {
      type: Number
    },

    // Minimum / Passing Marks
    minMarks: {
      type: Number,
      default: 33,
      min: [0, "Minimum marks cannot be negative"]
    },
    MinMarks: {
      type: Number
    },

    // Academic Year
    academicYear: {
      type: String,
      default: "2026-27"
    },
    AcademicYear: {
      type: String,
      default: "2026-27"
    },

    // Exam Status
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed", "Cancelled", "Active"],
      default: "Scheduled"
    }
  },
  { timestamps: true }
);

// Keep camelCase and legacy PascalCase fields synchronized
examSchema.pre("validate", function () {
  if (this.examName && !this.ExamName) this.ExamName = this.examName;
  if (this.ExamName && !this.examName) this.examName = this.ExamName;

  if (this.maxMarks !== undefined && this.MaxMarks === undefined) this.MaxMarks = this.maxMarks;
  if (this.MaxMarks !== undefined && this.maxMarks === undefined) this.maxMarks = this.MaxMarks;

  if (this.minMarks !== undefined && this.MinMarks === undefined) this.MinMarks = this.minMarks;
  if (this.MinMarks !== undefined && this.minMarks === undefined) this.minMarks = this.MinMarks;

  if (this.examDate && !this.StartDate) this.StartDate = this.examDate;
  if (this.StartDate && !this.examDate) this.examDate = this.StartDate;
  if (!this.EndDate) this.EndDate = this.examDate || this.StartDate;

  if (this.batchName && !this.ClassId) this.ClassId = this.batchName;
  if (this.ClassId && !this.batchName) this.batchName = this.ClassId;

  if (this.academicYear && !this.AcademicYear) this.AcademicYear = this.academicYear;
  if (this.AcademicYear && !this.academicYear) this.academicYear = this.AcademicYear;
});

const exam = mongoose.model("exam", examSchema);

module.exports = exam;
