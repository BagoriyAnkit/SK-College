const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    notice_title: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      default: "General",
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    issued_by: {
      type: String,
      default: "Administration",
      trim: true
    },
    publish_date: {
      type: Date,
      default: Date.now
    },
    for_whom: {
      type: String,
      enum: [
        "students", "faculty", "teachers", "staff", "all",
        "Students", "Faculty", "Teachers", "Staff", "All"
      ],
      default: "all"
    }
  },
  { timestamps: true }
);

const notice = mongoose.model("notice", noticeSchema);

module.exports = notice;