const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user");
const { Product } = require("./products");
/* Explanation: This file defines the Cart model, which stores a user’s shopping cart state. A cart is a document that belongs to a user and contains an array of item subdocuments. Each item references a product (`productRef`) and stores quantity (`unitsToBuy`) and computed price (`finalItemPrice`).This schema demonstrates a key NoSQL modeling pattern: embedding “line items” inside the cart document. This makes “read cart” fast (one document fetch), but it can make updates more complex (you must carefully mutate array elements). */
const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Use string reference to avoid circular dependencies
      index: true, // Crucial for performance as users scale
    },
    items: [
      {
        productRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: [true, "Product reference is required"],
        },
        unitsToBuy: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1"], // Prevents 0-unit items
          default: 1,
        },
        priceAtAddition: {
          type: Number,
          required: true,
          min: 0,
        },
        finalItemPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalItems: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "abandoned", "converted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    // Mongoose automatically injects two hidden fields into your schema: `createdAt` and `updatedAt`. These fields are automatically managed by Mongoose, so you don't need to set them manually. Whenever you create a new cart document, `createdAt` will be set to the current date and time. Whenever you update the cart document (e.g., adding items, changing quantities), `updatedAt` will be updated to the current date and time. This is extremely useful for implementing features like cart expiration (e.g., marking carts as "abandoned" if they haven't been updated for a certain period) or simply tracking when carts were created and last modified.
    // Automatically removes __v and transforms _id to id for frontend ease
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Middleware check: Automatically flag as abandoned if not touched for 1 week
// This "Virtual" checks the status on-the-fly when you fetch the cart
cartSchema.virtual("isExpired").get(function () {
  const oneWeekAgo = new Date(Date.now() - 24 * 60 * 60 * 7 * 1000);
  return this.updatedAt < oneWeekAgo && this.status === "active";
});

cartSchema.pre("save", function (next) {
  if (this.items.length > 0) {
    this.totalItems = this.items.reduce(
      (sum, item) => sum + item.unitsToBuy,
      0,
    );
    this.totalPrice = this.items.reduce((acc, item) => {
      return acc + item.finalItemPrice;
    }, 0);
  } else {
    this.totalItems = 0;
    this.totalPrice = 0;
  }
  next();
});
const cartModel = mongoose.model("Cart", cartSchema);
module.exports = { Cart: cartModel };
/* Explanation: The `user` field is an ObjectId reference to the User model; `populate("user")` can replace it with a user document. The `items` array embeds item objects. One subtle modeling detail: setting `unique: true` on the embedded `_id` field does not behave like a global unique index across all cart items; MongoDB unique indexes apply at collection level, not per nested array element in the way many expect. If you need uniqueness constraints (like “no duplicate productRef per cart”), enforce it at the application logic level or with different schema design. `timestamps: true` adds createdAt/updatedAt, which can be useful for cart expiry logic later. */
