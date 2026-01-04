const { Wishlist } = require("../models/wishlist");
const { throwNewError } = require("../utils");

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
