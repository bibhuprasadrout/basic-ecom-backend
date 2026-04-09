const { throwNewError, errorHandler } = require("./errorHandlers");
const {
  normalizeStrings,
  removeEmptyPatchKeys,
  loopPatchProfileInputs,
  updateProductStock,
  getCartPopulateOptions,
} = require("./helperFunctions");
module.exports = {
  errorHandler, // create a centralised catch error function
  normalizeStrings, // a function to normalize all strings in an object
  throwNewError, // generate and return an error
  removeEmptyPatchKeys, // helper for patch profile api
  loopPatchProfileInputs, // helper of patch user profile api to check if req has any fields without any modification made to them.
  updateProductStock, // helper to update product stock atomically and prevent overselling. This is used in cart controllers when adding/removing items to ensure inventory consistency.
  getCartPopulateOptions, // helper to get the populate options for cart queries, which includes product details and stock. This is used in cart controllers to ensure we always populate the same fields when fetching the cart, keeping the code DRY and consistent.
};
/* Explanation: This file is a “barrel” for the utils layer. A barrel file re-exports utilities from multiple modules so other parts of the codebase can import from one place. That’s why you see `require("./utils")` in other files: it gives access to `errorHandler`, `throwNewError`, and helper functions without needing to know the exact filenames.This is a maintainability pattern: as the project grows, you can reorganize internal util files without changing all import sites; you only update this barrel. It also acts like a public API for utils: only what you export here becomes “officially available” to the rest of the backend. */
