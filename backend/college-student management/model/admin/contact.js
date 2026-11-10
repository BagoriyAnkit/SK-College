const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        subject: String,
        message: String,
      
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;