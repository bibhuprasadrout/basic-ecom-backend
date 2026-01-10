const express = require("express");
const router = express.Router();

// importing middleware functions
const {
  authMiddleware,
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
} = require("../middlewares");

// importing controllers — they actually handle a route at the end of a api call
const {
  userControllerToSignup,
  userControllerToSignin,
  userControllerToGetProfile,
  userControllerToPatchProfile,
  userControllerToPatchPassword,
  userControllerToLogoutProfile,
  userControllerToDeleteProfile,
} = require("../controllers");

// POST / api / v1 / auth / refresh;

//
//
//
//  user APIs
router.post(
  "/api/v1/signup",
  signupIputValidator,
  isUserUnique,
  isUserNameUnique,
  userControllerToSignup
);

// userControllerToSignin
router.post(
  "/api/v1/signin/",
  signinInputValidator,
  ensureUserExists,
  comparePasswordToHashAtSignin,
  userControllerToSignin
);

// logout current user
router.post("/api/v1/logout/", userControllerToLogoutProfile);

// get profile data after login
router.get("/api/v1/auth/profile", userControllerToGetProfile);

// update profile by current end user
router.patch(
  "/api/v1/auth/profile",
  ensureUserPatchable,
  normalizePatchProfileInputs,
  patchProfileInputValidator,
  sanitizePatchUserNonStringProperties,
  sanitizePatchUserStringProperties,
  userControllerToPatchProfile
);

// delete profile by current end user
router.delete("/api/v1/auth/profile", userControllerToDeleteProfile);

// update password by current end user
router.patch("/api/v1/auth/password", userControllerToPatchPassword);

module.exports = {
  authRouter: router,
};
