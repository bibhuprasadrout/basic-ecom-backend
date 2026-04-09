const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV === "development") {
  // the dotenv config path is within an if statement to prevent any error caused due to wrong path in production mode.
  require("dotenv").config({ path: `../.env.${process.env.NODE_ENV}` }); // why do we need to configure the dotenv here? because we freshly require this file in the cart controller, and it needs access to the JWT secret key from the environment variables to decode the token.
}
const { throwNewError } = require("../utils");
const { Cart } = require("../models/cart");
const { Product } = require("../models/products");

const prepareCart = async (req, res, next) => {
  try {
    req.userId = null;
    // 1. Safely extract and verify the token from cookies, if it exists.
    if (req.cookies && req.cookies.jwt) {
      const token = req.cookies.jwt;
      const tokenMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.userId = tokenMessage.id || null;
    }
    /* Explanation: This block extracts user identity if a JWT cookie exists.
    If there is a cookie, it decodes it and sets `req.userId`. If there’s no cookie or if the token is invalid, `req.userId` remains null.*/

    // check if cart already exist
    // 2. Find THIS specific user's cart in the database. If it exists, attach its id to `req.cartId` and continue. If it doesn’t exist, create a new cart (optionally with an initial product if `productId` is provided), attach its id to `req.cartId`, and continue.
    const cart = await Cart.findOne({ user: req.userId });
    if (cart !== null) {
      req.cartId = cart._id;
      cart.user = req.userId;
      await cart.save();
      return next();
    }

    // 3. FIXED: If no cart exists, and they are just trying to view it (GET), let them pass.
    // The downstream controller should handle returning an empty array to the frontend.
    if (req.method === "GET") {
      req.cartId = null;
      return next();
    }

    // Cart.create saves automatically. No need to call save() again. Just create the cart and attach its id to req.cartId.
    const newCart = await Cart.create({
      user: req.userId,
      items: [],
    });

    req.cartId = newCart._id;
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = { prepareCart };
/* Explanation: The rest of the middleware implements “get or create cart”. It first tries to find an existing cart (currently it uses `Cart.findOne({ user: req.userId })`.

If a cart exists, it attaches its id to `req.cartId`, updates the cart’s `user` field to the current `req.userId`, saves it, and continues.

If no cart exists, it tries to create one using `productId` from the request body; if no productId is present, it returns a 400 error (“Cart is empty”).

If the product doesn’t exist or is out of stock, it errors. Otherwise it creates a new cart document with one item and continues.*/
