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
/* Explanation: This is the middlewares “barrel” file, similar to `routes/index.js` and `utils/index.js`. It collects middleware functions from multiple feature modules (auth, user validation/sanitization, cart preparation, wishlist preparation) and exports them as one object. The benefit is that route modules can import everything from `../middlewares` without remembering individual filenames.This file also documents the “policy surface” of your backend: looking at the export list tells you what kinds of checks and transformations exist (input validators, uniqueness checks, password verification, patch sanitization). Over time, keeping a clean, well-named middleware catalog helps the codebase scale and prevents duplicated logic across routes. */
