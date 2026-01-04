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
