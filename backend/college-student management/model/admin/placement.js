const mongoose = require("mongoose")

const placementSchema = new mongoose.Schema({
    StudentName: String,
    CompanyName: String,
    Package: String,
    Year: String,
    JobType: String,
    Location: String
},
    { timestamps: true }
)

const placement = mongoose.model("placement", placementSchema)

module.exports = placement