const mongoose = require("mongoose");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    if (process.env.NODE_ENV === "production") {
      console.log("MongoDB connected in production");
    } else if (process.env.NODE_ENV === "development") {
      console.log("MongoDB connected locally");
    }
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
module.exports = { connectDB };
