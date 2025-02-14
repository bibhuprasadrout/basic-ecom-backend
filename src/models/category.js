const mongoose = require("mongoose")
const { Schema } = mongoose
const chategorySchema = new Schema({
  slug: String,
  name: String,
  url: String,
  image: String
},)
  
const Category = mongoose.model("Category", chategorySchema)

module.exports = Category