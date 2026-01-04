const { authMiddleware } = require("./auth");
//
//
//
// Import User middleware
const {
  signupIputValidator,
  isUserUnique,
  isUserNameUnique,
  signinInputValidator,
  ensureUserExists,
  comparePasswordToHashAtSignin,
  ensureUserPatchable,
  normalizePatchProfileInputs,
  patchProfileInputValidator,
  sanitizePatchUserNonStringProperties,
  sanitizePatchUserStringProperties,
} = require("./userMiddlewares");
//
//
//
// Import cart middleware
const { prepareCart } = require("./cartMiddlewares");
//
//
//
// Import cart middleware
const { prepareWishlist } = require("./wishlistMiddlewares");
//
//
//
//
//
//
// Export all
module.exports = {
  // auth
  authMiddleware,
  // user
  signupIputValidator,
  isUserUnique,
  isUserNameUnique,
  signinInputValidator,
  ensureUserExists,
  comparePasswordToHashAtSignin,
  ensureUserPatchable,
  normalizePatchProfileInputs,
  patchProfileInputValidator,
  sanitizePatchUserNonStringProperties,
  sanitizePatchUserStringProperties,
  // cart
  prepareCart,
  // wishlist
  prepareWishlist,
};
