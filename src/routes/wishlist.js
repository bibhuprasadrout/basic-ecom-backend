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
/* Explanation: This router defines wishlist endpoints and uses middleware to enforce request prerequisites. Like the cart router, it runs `prepareWishlist` on each route so controllers can assume `req.wishlistId` is present and valid. The URL prefix includes `/api/v1/auth/...`, which suggests these endpoints are meant to be used by authenticated users; actual enforcement depends on your auth middleware placement. The POST route adds a product to the wishlist, the DELETE route removes it, and the GET route returns the wishlist. The `:productId` segment is a path parameter, meaning the product id is part of the URL and is available as `req.params.productId` in controllers. This is a common REST-like pattern for operating on a specific entity. */
