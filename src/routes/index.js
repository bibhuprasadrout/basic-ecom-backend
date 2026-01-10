const { authRouter } = require("./auth.js");
const { cartRouter } = require("./cart.js");
const { categoryRouter } = require("./category.js");
const { checkoutRouter } = require("./checkout.js");
const { productRouter } = require("./product.js");
const { userRouter } = require("./user.js");
const { wishlistRouter } = require("./wishlist.js");

module.exports = {
  authRouter,
  cartRouter,
  categoryRouter,
  checkoutRouter,
  productRouter,
  wishlistRouter,
  userRouter,
};
