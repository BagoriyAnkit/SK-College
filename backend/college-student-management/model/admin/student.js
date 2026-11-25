const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    StudentName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    Phonenumber: Number,
    Course: String,
    address: String,
    dob: Date,
    image: String,

    // 1. Roll Number
    rollNumber: {
      type: String,
      default: "",
      trim: true
    },

    // 2. Semester
    semester: {
      type: Number,
      default: 1,
      min: 1,
      max: 12
    },

    // 3. Batch (Connected using existing Batch model)
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null
    },

    // 4. Department (Connected using existing department model)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
      default: null
    },

    // 5. Parent/Guardian Name and Contact Number
    parentName: {
      type: String,
      default: "",
      trim: true
    },
    parentContact: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
    // Reference to authentication account (User in fronted/register)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const student = mongoose.model("student", studentSchema);

module.exports = student;
