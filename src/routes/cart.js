const express = require("express");
const router = express.Router();
const { prepareCart } = require("../middlewares");
const {
  getCart,
  addOneItemToCart,
  removeOneItemFromCart,
  deleteProductFromCart,
  deleteCart,
} = require("../controllers");
router.get("/api/v1/cart", prepareCart, getCart);
router.post("/api/v1/cart/add", prepareCart, addOneItemToCart);
router.post("/api/v1/cart/remove", prepareCart, removeOneItemFromCart);
router.delete("/api/v1/cart/:productId", prepareCart, deleteProductFromCart);
router.delete("/api/v1/cart", prepareCart, deleteCart);
// router.patch("/api/v1/cart/update"); // TODO, not critical right now.
module.exports = { cartRouter: router };
/* Explanation: This router defines the cart API. It also demonstrates one of the most important backend patterns: “middleware as reusable request preparation”. Notice every route uses `prepareCart` before the controller. That means the controller can assume certain invariants are already true: a cart exists (or a cart id is known), and request-scoped identifiers like `req.cartId` are set. This keeps controllers simpler and reduces duplicated setup logic.Each route is named by action: `/cart` to read, `/cart/add` to increment, `/cart/remove` to decrement, and `/cart/:productId` to delete a product line item. Some APIs prefer purely RESTful patterns (POST/DELETE on `/cart/items/:id`), but action-style routes are common too, especially early in development. The important part is consistency for the client.The route order here does not matter much because paths are distinct, but in Express, ordering can matter if you have overlapping patterns. The controllers then handle inventory consistency (stock decrement/increment) and cart persistence. */
