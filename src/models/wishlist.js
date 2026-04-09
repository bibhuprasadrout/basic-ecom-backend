const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user");
const { Product } = require("./products");
/* Explanation: This file defines the Wishlist model. A wishlist is similar to a cart in that it references products, but it usually doesn’t track quantities or pricing; it’s just a saved list. This schema models a wishlist as a document that belongs to exactly one user (`unique: true` on the user reference) and contains an array of product references. */
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
/* Explanation: The `user` field is a required ObjectId reference, meaning every wishlist belongs to a user. `unique: true` is intended to enforce one wishlist per user; again, true uniqueness should be enforced with an actual unique index. The `products` field is an array of objects with `_id` and `productRef`. Often, you can simplify this to just an array of `productRef` ObjectIds unless you need extra per-entry metadata. Keeping `default: []` means a new wishlist starts empty. With `timestamps: true`, you can later implement features like “recently updated wishlist” or clean up stale lists. */
