const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    DepartmentName: {
      type: String,
      required: true
    },
    DepartmentCode: {
      type: String,
      required: true
    },
    HOD: {
      type: String,
      default: ""
    },
    // Reference to Faculty model for the Head of Department
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
      default: null
    },
    Description: {
      type: String,
      default: ""
    },
    Status: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const department = mongoose.model("department", departmentSchema);

module.exports = department;
