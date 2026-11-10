const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    default: "",
    trim: true
  },
  duration: {
    type: String,
    required: true
  },
  totalSemester: {
    type: Number,
    required: true
  },
  courseType: {
    type: String,
    default: "UG"
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "Active"
  }
}, {
  timestamps: true
});

const course = mongoose.model('course', courseSchema);

module.exports = course;
