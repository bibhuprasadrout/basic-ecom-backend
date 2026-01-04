const { throwNewError } = require("../utils");
const { User } = require("../models/user");
const { Cart } = require("../models/cart");
const { Product } = require("../models/products");

const getCart = async (req, res, next) => {
  try {
    const populateOptions = [
      {
        path: "items.productRef",
        select:
          "_id title price discountPercentage rating stock sku availabilityStatus returnPolicy minimumOrderQuantity thumbnail",
      },
    ];
    if (req.userId !== null) {
      populateOptions.unshift({
        path: "user",
        select: "_id userName +birthDate +gender", // birthday and gender are not reflecting in db, debug later
      });
    }
    const cart = await Cart.findById(req.cartId).populate(populateOptions);
    if (!cart) throw throwNewError(404, "Cart is empty.");
    res.status(200).json({
      success: true,
      status: 200,
      message: "User cart is available.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

const addOneItemToCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    const pricePerUnit = product.price;
    const discount = product.discountPercentage || 0;

    const cart = await Cart.findById(req.cartId);
    if (!cart) throw throwNewError(404, "Cart is empty.");

    const itemInCart = cart.items.find(
      (item) => item.productRef && item.productRef.equals(product._id)
    );
    if (itemInCart) {
      if (product.stock > 0) {
        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gt: 0 } }, // atomic condition
          { $inc: { stock: -1 } },
          { new: true }
        );

        if (!updated) {
          throw throwNewError(400, "Product out of stock.");
        }
      }
      itemInCart.unitsToBuy += 1;
      itemInCart.finalItemPrice =
        (pricePerUnit - (discount / 100) * pricePerUnit) *
        itemInCart.unitsToBuy;
    }
    if (!itemInCart) {
      if (product.stock > 0) {
        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gt: 0 } }, // atomic condition
          { $inc: { stock: -1 } },
          { new: true }
        );

        if (!updated) {
          throw throwNewError(400, "Product out of stock.");
        }
      }

      cart.items = [
        {
          _id: productId,
          productRef: productId,
          unitsToBuy: 1,
          finalItemPrice: pricePerUnit - (discount / 100) * pricePerUnit,
        },
        ...cart.items,
      ];
    }
    await cart.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "Item count incresssed by one in cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

const removeOneItemFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.cartId);
    if (!cart) throw throwNewError(404, "Cart is empty.");

    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) throw throwNewError(400, "Product out of stock.");

    const itemInCart = cart.items.find(
      (item) => item.productRef && item.productRef.equals(product._id)
    );

    if (!itemInCart) throw throwNewError(404, "Product not in cart.");
    if (itemInCart) {
      itemInCart.unitsToBuy -= 1;
      if (itemInCart.unitsToBuy <= 0) {
        const itemIndex = cart.items.findIndex(
          (item) => item.productRef && item.productRef.equals(product._id)
        );
        if (itemIndex !== -1) cart.items.splice(itemIndex, 1);
      }
    }
    await cart.save();
    const updated = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gt: 0 } }, // atomic condition
      { $inc: { stock: 1 } },
      { new: true }
    );

    if (!updated) {
      throw throwNewError(400, "Product out of stock.");
    }

    if (cart.items.length <= 0) {
      await Cart.findByIdAndDelete(req.cartId);
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Cart is now empty and has been deleted.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Item count decreased by one in cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

const deleteProductFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.cartId);
    if (!cart) throw throwNewError(404, "Cart is empty.");

    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) throw throwNewError(400, "Product not found.");

    const itemIndex = cart.items.findIndex(
      (item) => item.productRef && item.productRef.equals(product._id)
    );
    if (itemIndex === -1) throw throwNewError(404, "Product not in cart.");
    const unitsToRestore = cart.items[itemIndex]?.unitsToBuy || 0;
    if (itemIndex !== -1) cart.items.splice(itemIndex, 1);

    const updated = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $inc: { stock: unitsToRestore },
      }
    );

    if (!updated) {
      throw throwNewError(400, "Product out of stock.");
    }
    await cart.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "Product removed from cart.",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.cartId);
    if (!cart) throw throwNewError(404, "Cart not found.");

    for (const item of cart.items) {
      const unitsToRestore = item.unitsToBuy;
      const productId = item.productRef;
      await Product.findOneAndUpdate(productId, {
        $inc: { stock: unitsToRestore },
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Cart is empty.",
    });
  } catch (err) {
    next(err);
  }
};

// const updateOneItemInCart = (req, res, next) => {}; // TODO, Not critical requirement rit now

module.exports = {
  getCart,
  addOneItemToCart,
  //   updateOneItemInCart,
  removeOneItemFromCart,
  deleteProductFromCart,
  deleteCart,
};
