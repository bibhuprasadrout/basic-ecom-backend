const mongoose = require("mongoose")
const { Schema } = mongoose
const chategorySchema = new Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String },
  image: { type: String },
});
  
const Category = mongoose.model("Category", chategorySchema)

module.exports = Category