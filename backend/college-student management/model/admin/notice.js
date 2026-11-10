const mongoose = require("mongoose")
const noticeSchema = new mongoose.Schema({
   notice_title: String,
   department: String,
   description: {
    type: String,
    required: true,
},
   issued_by: String,
   publish_date: Date,
   for_whom: {
      type: String,
      enum: ["students", "faculty", "all"],
      default: "all"
   }
}, { timestamps: true })

const notice = mongoose.model("notice", noticeSchema)


module.exports = notice