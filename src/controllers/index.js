const { userControllerToSignup, userControllerToSignin, userControllerToGetProfile, userControllerToPatchProfile, userControllerToPatchPassword, userControllerToLogoutProfile, userControllerToDeleteProfile } = require("./userApiControllers");
const { getAllProducts, getNRandomProducts, getProductById, getProductByName } = require("./productsApiControllers");
const { getAllCategoriesList } = require("./categoriesApiController");
const { getCart, addOneItemToCart, removeOneItemFromCart, deleteProductFromCart, deleteCart } = require("./cartApiController");
const { getWishlist, addProductToWishlist, deleteProductFromWishlist } = require("./wishlistApiController");
/* Explanation: This file is a “barrel” (aggregator) module for controllers. In larger Node/Express projects, you often have many controller modules and you want a single import point for them. Instead of requiring each controller file separately in every routes file, you can import from `controllers/index.js` and destructure what you need.This improves maintainability: if you rename/move a controller file, you update the barrel in one place. It also improves discoverability: new developers can open this file to see what high-level API capabilities exist (auth, products, cart, wishlist, etc.).Conceptually, this file does not define business logic; it only re-exports functions that do. In module system terms, it’s creating a single “public interface” for the controllers layer. */
module.exports = {
  // user auth
  userControllerToSignup,
  userControllerToSignin,
  userControllerToGetProfile,
  userControllerToPatchProfile,
  userControllerToPatchPassword,
  userControllerToLogoutProfile,
  userControllerToDeleteProfile,
  // product
  getAllProducts,
  getNRandomProducts,
  getProductById,
  getProductByName,
  // category
  getAllCategoriesList,
  // cart
  getCart,
  addOneItemToCart,
  removeOneItemFromCart,
  deleteProductFromCart,
  deleteCart,
  // wishlist
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
  // checkout
};
/* Explanation: The exported object is what `require("./controllers")` returns. Each property is a function that routes can attach to endpoints. A useful learning detail: in CommonJS, `module.exports = { ... }` sets the value that the requiring module receives. There’s no “automatic named export” like ESM; it’s just an object. This is why consistent naming matters: the key names here become the API that the rest of your backend imports and depends on. */
