const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true
    },

    // Reference to course model (registered as "course")
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "course",
      default: null
    },

    // Course name preserved for backward compatibility and fast display
    courseName: {
      type: String,
      default: "",
      trim: true
    },

    session: {
      type: String,
      required: true,
      trim: true
    },

    strength: {
      type: Number,
      required: true
    },

    // Reference to faculty model (registered as "faculty")
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "faculty",
      default: null
    },

    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
