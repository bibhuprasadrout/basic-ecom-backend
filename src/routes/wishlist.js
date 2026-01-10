const express = require("express");
const router = express.Router();

const { prepareWishlist } = require("../middlewares");

const {
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
} = require("../controllers");

router.get("/api/v1/auth/wishlist", prepareWishlist, getWishlist);
router.post(
  "/api/v1/auth/wishlist/:productId",
  prepareWishlist,
  addProductToWishlist
);
router.delete(
  "/api/v1/auth/wishlist/:productId",
  prepareWishlist,
  deleteProductFromWishlist
);
module.exports = { wishlistRouter: router };
