const mongoose = require("mongoose");
const { Schema } = mongoose;
/* Explanation: This model represents product categories (like shoes, electronics, etc.). Categories are usually used for navigation and filtering. In MongoDB terms, this schema defines documents in the `categories` collection. The schema includes fields like `slug` (URL-friendly identifier), `name` (display name), `image`, and `url` (hidden by default). */
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

module.exports = { Category: mongoose.model("Category", chategorySchema) };
/* Explanation: `select: false` on the `url` field means Mongoose will not include it in query results unless explicitly requested. This is a data-leak prevention and payload-size optimization technique. The `unique: true` constraint on name is intended to prevent duplicate category names; note that true uniqueness should also be enforced by a MongoDB unique index to avoid race conditions. The schema name `chategorySchema` contains a typo but doesn’t affect runtime; it’s just a variable name. */
