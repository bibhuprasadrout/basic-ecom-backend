const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user");
const { Product } = require("./products");

const wishlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 30,
      default: "Wishlist",
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
      unique: true,
    },
    products: {
      type: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
          },
          productRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Product,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);
const wishlistModel = mongoose.model("Wishlist", wishlistSchema);
module.exports = { Wishlist: wishlistModel };
