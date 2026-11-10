const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbAsync = () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    const errorMessage = "FATAL ERROR: MONGODB_URI is not defined in the environment. Please configure MONGODB_URI in your .env file.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return mongoose
    .connect(mongoUri)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      throw err;
    });
};

module.exports = dbAsync;
