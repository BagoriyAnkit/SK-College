const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({

    event_title: String,
    // description: String,
    event_date: Date,
    start_time: String,
    end_time: String,
    location: String,
    image: String,
//     event_type: {
//     type: String,
//     enum: ["Upcoming", "Previous"],
//     default: "Upcoming"
// },
    status: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

const Event = mongoose.model("Event", eventSchema)


module.exports = Event