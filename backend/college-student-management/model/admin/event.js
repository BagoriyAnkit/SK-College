const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    event_title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    event_date: {
      type: Date,
      default: Date.now
    },
    start_time: {
      type: String,
      default: "10:00 AM"
    },
    end_time: {
      type: String,
      default: "01:00 PM"
    },
    location: {
      type: String,
      default: "College Main Auditorium"
    },
    image: {
      type: String,
      default: ""
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;