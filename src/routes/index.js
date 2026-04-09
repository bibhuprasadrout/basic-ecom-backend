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
/* Explanation: This is a routes “barrel” file (also called an index aggregator). The purpose is to collect all feature routers (auth, products, cart, etc.) and export them from one module. In Express, a router is a mini application that defines routes and middleware for a specific feature area. By aggregating them here, your main app file (`app.js`) can import `{ authRouter, productRouter, ... }` from `./routes` instead of requiring each file individually.This pattern improves maintainability as your API grows: you add a new router file, export it here, and the app can mount it. It also makes the backend’s “surface area” easy to scan because you can see all routers in one place. */
