const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Admin",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: Number,
    password: {
      type: String,
      required: true,
    },
    address: String,
    dob: String,
    role: {
      type: String,
      enum: ["admin", "subadmin", "staff", "hod", "teacher", "accountant", "student"],
      default: "admin",
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    image: String,
    // Reference to faculty profile record (faculty in admin/faculty)
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Admin =
  mongoose.models.AdminUser ||
  mongoose.model("AdminUser", userSchema, "admin_users");

module.exports = Admin;