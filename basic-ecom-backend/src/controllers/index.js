const {
  userControllerToSignup,
  userControllerToSignin,
  userControllerToGetProfile,
  userControllerToPatchProfile,
  userControllerToPatchPassword,
  userControllerToLogoutProfile,
  userControllerToDeleteProfile,
} = require("./userApiControllers");
const {
  getAllProducts,
  getProductById,
  getProductByName,
} = require("./productsApiControllers");
const { getAllCategoriesList } = require("./categoriesApiController");
const {
  getCart,
  addOneItemToCart,
  removeOneItemFromCart,
  deleteProductFromCart,
  deleteCart,
} = require("./cartApiController");
const {
  getWishlist,
  addProductToWishlist,
  deleteProductFromWishlist,
} = require("./wishlistApiController");
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
