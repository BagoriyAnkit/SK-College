const mongoose = require("mongoose");

const memoriesSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Memories = mongoose.model("Memories", memoriesSchema);

module.exports = Memories;