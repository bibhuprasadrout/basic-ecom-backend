const jwt = require("jsonwebtoken");
require("dotenv").config({ path: `../../.env.${process.env.NODE_ENV}` });
const { throwNewError } = require("../utils");
const { Cart } = require("../models/cart");
const { Product } = require("../models/products");

const prepareCart = async (req, res, next) => {
  try {
    req.userId = null;
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      const tokenMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = tokenMessage.id || null;
    }
    // check if cart already exist
    const cart = await Cart.findOne();
    if (cart !== null) {
      req.cartId = cart._id;
      cart.user = req.userId;
      await cart.save();
      return next();
    }
    // if no cart available, will create a new one
    const { productId } = req.body;
    if (!cart && !productId) {
      const err = throwNewError(400, "Cart is empty.");
      return next(err);
    }
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) {
      const err = throwNewError(400, "Product out of stock.");
      return next(err);
    }
    const newCart = await Cart.create({
      user: req.userId,
      items: [
        {
          _id: productId,
          productRef: productId,
        },
      ],
    });
    await newCart.save();
    req.cartId = newCart._id;
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = { prepareCart };
