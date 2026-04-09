const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // We copy the items exactly as they were at the time of purchase
    items: [
      {
        productRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        unitsToBuy: { type: Number, required: true },
        priceAtAddition: { type: Number, required: true },
        finalItemPrice: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    // Crucial for the next phase
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    stripeTransactionId: { type: String },
    deliveryStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
      default: "processing",
    },
  },
  { timestamps: true },
);

module.exports = { Order: mongoose.model("Order", orderSchema) };
/* Explanation: This Mongoose schema defines the structure of an Order document in MongoDB. Each order is linked to a user and contains an array of items, where each item references a product and includes purchase details. The schema also captures the total amount, shipping address, payment status, Stripe transaction ID, and delivery status. Timestamps are enabled to automatically track when orders are created and updated. This model will be used in the order controller to create and manage orders in the database. */
