const mongoose = require("mongoose");

const staticPageSchema = new mongoose.Schema({
    title: String,

    description: String,

    image: String,

    slug: {
        type: String,
        unique: true
    }

}, { timestamps: true });

const staticPage = mongoose.model("staticPage", staticPageSchema);

module.exports = staticPage;