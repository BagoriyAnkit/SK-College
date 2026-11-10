const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    TeacherName: String,
    Email: String,
    PhoneNumber: Number,
    Department: String,
    // Reference to Department model for the faculty's department
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department",
      default: null,
    },
    Qualification: String,
    Experience: String,
    gender: String,
    status: {
      type: String,
      default: "Active",
    },
    // Reference to staff authentication account (AdminUser in admin/user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const faculty = mongoose.model("faculty", facultySchema);

module.exports = faculty;
