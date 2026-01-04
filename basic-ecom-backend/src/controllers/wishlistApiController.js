const { Wishlist } = require("../models/wishlist");
const { throwNewError } = require("../utils");

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId).populate([
      { path: "user", select: "_id userName +birthDate +gender" }, // birthday and gender are not reflecting in db, debug later
      {
        path: "products.productRef",
        select:
          "_id title price discountPercentage rating stock sku availabilityStatus returnPolicy minimumOrderQuantity thumbnail",
      },
    ]);
    if (!wishlist)
      throw throwNewError(
        500,
        "Wishlist not created due to internal server error."
      );
    res.status(200).json({
      success: true,
      status: 200,
      message: "Wishlist is available.",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

const addProductToWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId);
    if (!wishlist)
      throw throwNewError(
        500,
        "Wishlist not found due to internal server error."
      );

    if (!Array.isArray(wishlist.products)) {
      wishlist.products = [];
    }

    const nullProduct = wishlist.products.find((item) => !item?._id);
    if (nullProduct) {
      const nullProductIndex = wishlist.products.findIndex(
        (item) => !item?._id
      );
      if (nullProductIndex != -1) {
        wishlist.products.splice(nullProductIndex, 1);
      }
    }

    const { productId } = req.params;
    const productInWishlist = wishlist.products.find(
      (item) => item?._id?.toString() === productId.toString()
    );
    if (!productInWishlist) {
      wishlist.products.unshift({
        _id: productId,
        productRef: productId,
      });
      await wishlist.save();
      res.status(200).json({
        success: true,
        status: 200,
        message: "Product added to wishlist.",
        data: wishlist,
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Product already exists in wishlist.",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

const deleteProductFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findById(req.wishlistId);
    if (!wishlist)
      throw throwNewError(
        500,
        "Wishlist not found due to internal server error."
      );
    //   If only null product is available, there is nothing to delete
    const nullProduct = wishlist.products.find((item) => !item?._id);
    if (wishlist.products.length === 1 && nullProduct) {
      throw throwNewError(400, "Nothing to delete, Wishlist is empty.");
    }

    const { productId } = req.params;
    console.log(typeof productId);

    // deleteing the product
    if (!productId)
      throw throwNewError(400, "Please select a product to remove.");

    const indexOfProductToBeDeleted = wishlist.products.findIndex(
      (item) => item?._id?.toString() === productId?.toString()
    );
    if (indexOfProductToBeDeleted != -1) {
      wishlist.products.splice(indexOfProductToBeDeleted, 1);
    } else {
      throw throwNewError(400, "Product not found in wishlist.");
    }
    if (wishlist.products.length === 0) {
      wishlist.products.unshift({
        _id: null,
        productRef: null,
      });
    }
    await wishlist.save();
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Product deleted from wishlist.",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
};
