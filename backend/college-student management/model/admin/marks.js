const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    // Exam Reference
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "exam",
      required: [true, "Exam reference is required"],
      index: true
    },

    // Student Reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      required: [true, "Student reference is required"],
      index: true
    },

    // Helper display fields (saved for fast indexing and rendering)
    studentName: {
      type: String,
      default: "",
      trim: true
    },
    rollNumber: {
      type: String,
      default: "",
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

    // Subject
    subject: {
      type: String,
      default: "",
      trim: true
    },

    // Marks Obtained
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
      min: [0, "Obtained marks cannot be negative"]
    },

    // Maximum Marks
    maxMarks: {
      type: Number,
      required: [true, "Maximum marks is required"],
      min: [1, "Maximum marks must be greater than 0"]
    },

    // Percentage
    percentage: {
      type: Number,
      default: 0
    },

    // Grade (A+, A, B+, B, C, D, F)
    grade: {
      type: String,
      default: ""
    },

    // Result Status (Pass / Fail)
    status: {
      type: String,
      enum: ["Pass", "Fail"],
      default: "Pass"
    },

    // Remarks
    remarks: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate marks entries for the same student and exam
marksSchema.index({ exam: 1, student: 1 }, { unique: true });

const marks = mongoose.model("marks", marksSchema);

module.exports = marks;
