const { Wishlist } = require("../models/wishlist");
const { throwNewError } = require("../utils");
/* Explanation: This middleware prepares wishlist context, similar to how `prepareCart` prepares cart context. The wishlist feature assumes a wishlist belongs to the authenticated user. Instead of making each wishlist controller fetch/create the wishlist, this middleware ensures a wishlist exists and attaches its id to the request (`req.wishlistId`). This is a common backend pattern: “resolve resource id once in middleware, reuse in controllers.” */

const prepareWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.userId });
    if (wishlist !== null) {
      req.wishlistId = wishlist._id;
      return next();
    }
    const { productId = null } = req.params;

    const createWishlist = await Wishlist.create({
      name: "Wishlist",
      user: req.userId,
      products: [{ _id: productId, productRef: productId }],
    });
    if (!createWishlist) {
      const err = throwNewError(
        500,
        "Wishlist not created due to internal server error."
      );
      return next(err);
    }
    req.wishlistId = createWishlist._id;
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = { prepareWishlist };
/* Explanation: The logic is: look up wishlist by the current user id. If found, store its id on `req` and continue. If not found, create one. The create flow optionally seeds the wishlist with a product id from the URL params, which supports “add to wishlist” calls that may be the first wishlist interaction for a user. If creation fails, it forwards a 500 error.This middleware relies on `req.userId` already being set by auth middleware. That means route/middleware ordering matters: you must ensure authentication runs before `prepareWishlist` on protected endpoints. If `req.userId` is missing or null, this code may create wishlists without a valid user reference (or fail validation), so correct auth mounting is essential. */
