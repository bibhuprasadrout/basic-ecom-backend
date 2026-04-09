const { Wishlist } = require("../models/wishlist");
const { throwNewError } = require("../utils");
/* Explanation: This controller module manages the wishlist feature: reading the wishlist, adding products, and removing products. A wishlist is typically a user-associated collection of product references. `Wishlist` is a Mongoose model, so methods like `findById`, `save`, and `populate` are database operations that return Promises. `throwNewError` helps create consistent HTTP errors that your global error handler can format for the client. */
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId).populate([
      { path: "user", select: "_id userName +birthDate +gender" },
      { path: "products.productRef", select: "_id title price discountPercentage rating stock sku availabilityStatus returnPolicy minimumOrderQuantity thumbnail" },
    ]);
    if (!wishlist) throw throwNewError(500, "Wishlist not created due to internal server error.");
    res.status(200).json({ success: true, status: 200, message: "Wishlist is available.", data: wishlist });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `getWishlist` is a read endpoint. It looks up the wishlist by `req.wishlistId`, which is presumably attached by earlier middleware (for example, an auth middleware that knows the current user and their wishlist). The `.populate(...)` call is a Mongoose concept: it replaces stored ObjectId references with actual documents. Here you populate the wishlist’s `user` reference and each product reference under `products.productRef`, selecting only the fields needed by the frontend. This is like performing “joins” in MongoDB/Mongoose. Populating is convenient, but it has performance cost: it may trigger additional queries. Selecting fields limits payload size and reduces exposure of sensitive data. */
const addProductToWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId);
    if (!wishlist) throw throwNewError(500, "Wishlist not found due to internal server error.");
    if (!Array.isArray(wishlist.products)) wishlist.products = [];
    const nullProduct = wishlist.products.find((item) => !item?._id);
    if (nullProduct) {
      const nullProductIndex = wishlist.products.findIndex((item) => !item?._id);
      if (nullProductIndex != -1) wishlist.products.splice(nullProductIndex, 1);
    }
    const { productId } = req.params;
    const productInWishlist = wishlist.products.find((item) => item?._id?.toString() === productId.toString());
    if (!productInWishlist) {
      wishlist.products.unshift({ _id: productId, productRef: productId });
      await wishlist.save();
      return res.status(200).json({ success: true, status: 200, message: "Product added to wishlist.", data: wishlist });
    }
    return res.status(200).json({ success: true, status: 200, message: "Product already exists in wishlist.", data: wishlist });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `addProductToWishlist` is a write endpoint that maintains a set-like list of products. It loads the wishlist, ensures `wishlist.products` is an array, then removes a special “null placeholder” element if present. That placeholder pattern (storing `{_id: null}`) is sometimes used to avoid empty arrays or to simplify UI assumptions, but it adds complexity because every mutation must clean it up. Then it checks if the product already exists (by comparing ids as strings) and either inserts it (`unshift` adds to the start, meaning “most recently added first”) or returns a “already exists” response. The function returns 200 in both cases, which is fine for idempotent add behavior (adding something that’s already there doesn’t error). A further improvement could be using `$addToSet` at the database level to avoid race conditions, but we keep current behavior unchanged. */
const deleteProductFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId);
    if (!wishlist) throw throwNewError(500, "Wishlist not found due to internal server error.");
    const nullProduct = wishlist.products.find((item) => !item?._id);
    if (wishlist.products.length === 1 && nullProduct) throw throwNewError(400, "Nothing to delete, Wishlist is empty.");
    const { productId } = req.params;
    if (!productId) throw throwNewError(400, "Please select a product to remove.");
    const indexOfProductToBeDeleted = wishlist.products.findIndex((item) => item?._id?.toString() === productId?.toString());
    if (indexOfProductToBeDeleted != -1) wishlist.products.splice(indexOfProductToBeDeleted, 1);
    else throw throwNewError(400, "Product not found in wishlist.");
    if (wishlist.products.length === 0) wishlist.products.unshift({ _id: null, productRef: null });
    await wishlist.save();
    return res.status(200).json({ success: true, status: 200, message: "Product deleted from wishlist.", data: wishlist });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `deleteProductFromWishlist` removes a product reference from the wishlist. It performs validation and then uses `findIndex` + `splice` to remove the matching element. After deletion, it re-inserts the `{_id: null}` placeholder if the list became empty. The method returns 200 with a success message. A common backend concept shown here is “input validation”: you must validate params and state (wishlist exists, product exists in list) before mutating and saving. Another concept is “id normalization”: Mongoose ObjectIds are objects, so comparing them directly often fails; converting to string is a quick way to compare values. */
module.exports = { getWishlist, addProductToWishlist, deleteProductFromWishlist };
/* Explanation: This module export is the public interface of the wishlist controller. Routes will import these functions and attach them to HTTP endpoints. */
