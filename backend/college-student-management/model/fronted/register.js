const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
  {
    full_name: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    mobile_no: Number,
    course: String,
    status: {
      type: String,
      default: "Inactive",
    },
    role: {
      type: String,
      enum: ["student", "user"],
      default: "student",
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    // Reference to student academic profile (model/admin/student)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student",
      default: null,
    },
    // Password reset fields (hash of single-use token + expiry)
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    // Timestamp for session/token invalidation upon password reset
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", registerSchema);
module.exports = User;