const { Cart } = require("../models/cart");
const { Order } = require("../models/order");
const { throwNewError } = require("../utils"); // Assuming you have this helper

const createPendingOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Basic validation
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      throw throwNewError(400, "Incomplete shipping address provided.");
    }

    // 2. Fetch the cart using req.cartId (set by your prepareCart middleware)
    const cart = await Cart.findById(req.cartId);
    if (!cart || cart.items.length === 0) {
      throw throwNewError(
        400,
        "Cannot proceed to checkout with an empty cart.",
      );
    }

    // 3. Create the Order.
    // We trust the cart.totalPrice calculated by our DB, NOT the frontend.
    const newOrder = await Order.create({
      user: req.userId, // Set by your auth middleware
      items: cart.items.map((item) => ({
        productRef: item.productRef,
        unitsToBuy: item.unitsToBuy,
        priceAtAddition: item.priceAtAddition,
        finalItemPrice: item.finalItemPrice,
      })),
      totalAmount: cart.totalPrice,
      shippingAddress,
      paymentStatus: "pending", // Payment hasn't happened yet!
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: "Shipping information saved. Order is pending payment.",
      data: newOrder,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPendingOrder };
