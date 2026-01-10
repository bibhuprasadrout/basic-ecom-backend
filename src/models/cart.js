const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user");
const { Product } = require("./products");
const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    items: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          unique: true,
        },
        productRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Product,
          required: true,
        },
        unitsToBuy: { type: Number, min: 0, default: 0 },
        finalItemPrice: { type: Number, min: 0, default: 0 },
      },
    ],
  },
  { timestamps: true }
);
const cartModel = mongoose.model("Cart", cartSchema);
module.exports = { Cart: cartModel };
