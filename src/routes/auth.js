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
/* Explanation: This file defines authentication and user-account routes (signup/signin/logout/profile management). It also demonstrates the “middleware pipeline” concept in Express: each route is a chain of functions that run in order. Middleware functions are used for validation, normalization, and authorization, while controllers are used for the final business action and response. Keeping these responsibilities separate makes the code easier to reason about and test.A quick mental model: routes define the HTTP contract (URLs + methods), middleware enforces rules and prepares data, and controllers perform the operation and send the response. */

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
  userControllerToSignup,
);
/* Explanation: Signup route pipeline: `signupIputValidator` ensures required fields exist and are valid (email format, password rules, etc.). `isUserUnique` and `isUserNameUnique` enforce uniqueness constraints before attempting to create a user (this produces better error messages than relying only on DB unique indexes). Finally `userControllerToSignup` saves the user. A deeper backend concept: even with these checks, you still need database-level uniqueness (unique indexes) to prevent race conditions (two requests arriving simultaneously). Middleware validation improves UX; DB constraints guarantee correctness. */

// userControllerToSignin
router.post(
  "/api/v1/signin",
  signinInputValidator,
  ensureUserExists,
  comparePasswordToHashAtSignin,
  userControllerToSignin,
);
/* Explanation: Signin route pipeline: validate the payload first, then ensure the user exists, then compare the provided password to the stored hash, then issue a session token/cookie in the controller. Notice the ordering: you only do expensive or sensitive operations (hash comparison, token generation) after basic validation passes. This is both a security and performance pattern. Also note the trailing slash in the path (`/signin/`); Express treats `/signin` and `/signin/` similarly by default, but consistency helps avoid confusing client bugs. */

// logout current user
router.post("/api/v1/logout", userControllerToLogoutProfile);
/* Explanation: Logout typically clears the auth cookie. Depending on your architecture, you may also invalidate tokens server-side (token blacklist) or rotate secrets. In your current implementation, logout is a simple stateless “remove cookie” flow, which is common for JWT-in-cookie setups. */

// get profile data after login
router.get("/api/v1/auth/profile", userControllerToGetProfile);
/* Explanation: Profile read endpoint. Because the path includes `/auth/`, it suggests it’s a protected route (requires authentication). Whether it is actually protected depends on where your auth middleware is mounted (in `app.js` you mount `authMiddleware` under `/api/v1/auth`). The controller then uses `req.userId` (provided by middleware) to fetch the user. This demonstrates a layered auth approach: middleware proves identity; controller uses identity. */

// update profile by current end user
router.patch(
  "/api/v1/auth/profile",
  ensureUserPatchable,
  normalizePatchProfileInputs,
  patchProfileInputValidator,
  sanitizePatchUserNonStringProperties,
  sanitizePatchUserStringProperties,
  userControllerToPatchProfile,
);
/* Explanation: Profile patch endpoint shows a richer validation/normalization pipeline. Patch endpoints are tricky because they accept partial updates and must enforce a whitelist of allowed fields. Your middleware chain suggests you: (1) ensure the current user is allowed to be patched, (2) normalize inputs (consistent casing, trimming, escaping), (3) validate allowed shapes/rules, and (4) sanitize different types of values before calling the controller. This is a “defense-in-depth” approach: multiple layers reduce the chance of storing unsafe or invalid data. */

// delete profile by current end user
router.delete("/api/v1/auth/profile", userControllerToDeleteProfile);
/* Explanation: Delete profile is a destructive operation. In robust systems, you typically require additional confirmation (password re-entry) and you may perform soft deletes (mark user as deleted) rather than hard deletes, to support account recovery and audit requirements. Your controller currently hard deletes and clears cookies, which is fine for a learning project. */

// update password by current end user
router.patch("/api/v1/auth/password", userControllerToPatchPassword);
/* Explanation: Password change endpoint. In secure designs, password changes usually require verifying the current password and applying password strength policies. Your controller currently prevents reusing the current password by comparing hashes. You can later extend this endpoint with middleware validators similar to signup/signin. */

module.exports = {
  authRouter: router,
};
/* Explanation: Exporting the router under the name `authRouter` is a convention that makes it clear what feature the router serves. The main app can mount it once, and all the endpoints above become active. */
