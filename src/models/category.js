const mongoose = require("mongoose")
const { Schema } = mongoose
const chategorySchema = new Schema({
  slug: { type: String, required: true },
  name: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    trim: true,
    lowercase: true,
  },
  url: { type: String, select: false },
  image: {
    type: String,
    default: "https://dummyjson.com/image/130x200",
    trim: true,
  },
});
  
const Category = mongoose.model("Category", chategorySchema)

module.exports = Category