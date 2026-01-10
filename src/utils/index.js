const { throwNewError, errorHandler } = require("./errorHandlers");
const {
  normalizeStrings,
  removeEmptyPatchKeys,
  loopPatchProfileInputs,
} = require("./helperFunctions");

module.exports = {
  errorHandler, // create a centralised catch error function
  normalizeStrings, // a function to normalize all strings in an object
  throwNewError, // generate and return an error
  removeEmptyPatchKeys, // helper for patch profile api
  loopPatchProfileInputs, // helper of patch user profile api to check if req has any fields without any modification made to them.
};
