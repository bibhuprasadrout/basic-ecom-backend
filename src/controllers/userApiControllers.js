const jwt = require("jsonwebtoken");
require("dotenv").config({ path: `../../.env.${process.env.NODE_ENV}` });
const { throwNewError } = require("../utils");
const { User } = require("../models/user");
/* Explanation: This controller module implements user/authentication endpoints: signup, signin (issue session token), profile read/update, password changes, logout, and delete profile.It also demonstrates a classic web security concept: authentication via signed tokens stored in HTTP-only cookies. `jsonwebtoken` is used to create JWTs (JSON Web Tokens). A JWT is a compact, signed string that encodes claims (like user id and email). Because it is signed with a secret key, the server can later verify that the token was issued by the server and was not tampered with. JWTs are not encrypted by default; they are just signed. That means you should not put sensitive secrets in the token payload, only identifiers/claims you are comfortable exposing to the client if the token is decoded. `dotenv` is loaded with an environment-specific file path, enabling local dev to use `.env.development` while production typically injects env vars directly. `throwNewError` standardizes error creation so the global error handler can respond with correct status codes. `User` is the Mongoose model representing your users collection. */
const cookieOptions = {
  httpOnly: true,
  path: "/api/v1/",
  maxAge: 1000 * 60 * 60 * 1, // 1 hour
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection required
  secure: process.env.NODE_ENV === "production", // only over HTTPS (set false in local dev)
};
if (process.env.NODE_ENV === "production") {
} else if (process.env.NODE_ENV === "development") {
  cookieOptions.domain = "localhost";
}
// TODO: add refresh token mecanism, add CSRF tokens mechanism (random value stored server‑side, validated on each request), add Double Submit Cookie pattern (send a second cookie and compare). Example: path: "/api" so it’s not sent to unrelated routes.
/* Explanation: These cookie options define how the browser stores and sends the auth cookie. This is where security and browser behavior meet backend logic.`httpOnly: true` prevents JavaScript from reading the cookie via `document.cookie`, which reduces impact of XSS (malicious scripts stealing tokens). `secure` ensures cookies are only sent over HTTPS in production. `sameSite` controls whether cookies are sent on cross-site requests; this is a primary defense against CSRF, but if your frontend and backend are on different sites and you need cookies, you may need `sameSite: "none"` plus `secure: true` (which is why production uses none). `path` restricts where the cookie is sent; here it is `/api/v1/`, meaning the cookie will be sent only for routes under that prefix. `maxAge` sets cookie expiry time (here 1 hour). The `domain` setting in development forces cookie scope to localhost; in production, you usually set an explicit domain like `.yourdomain.com` if needed. Small mistakes in cookie options can cause “works in Postman but not in browser” bugs, because browsers enforce these rules strictly. */

const userControllerToSignup = async (req, res, next) => {
  try {
    const { firstName, lastName, userName, email, password } = req.body;
    const user = new User({
      firstName,
      lastName,
      userName,
      email,
      password,
    });
    await user.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "User successfully added to DB",
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Signup creates a new user document. It reads user fields from `req.body`, constructs a `User` instance, and calls `save()`. The important “invisible” piece is how your User model handles passwords: in secure systems, passwords are never stored in plain text. Typically the model has a pre-save hook that hashes `password` (bcrypt/argon2) before writing to DB. If that hashing is present, this controller stays simple. If it is not present, you must add it, because storing raw passwords is a critical security vulnerability. The response returns success but does not issue a session token; your frontend currently navigates to `/signin` after signup, matching this design. */

const userControllerToSignin = (req, res, next) => {
  try {
    const { email } = req.body;
    const user = req.user;

    // create the json web token, made sure to have different secrets for development and production
    const token = jwt.sign(
      { id: user._id, email: email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "3h",
      },
    );

    // place the json web token in a cookie, the cookie enclosing the jwt is sent along with the response
    res
      .cookie("jwt", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Signed in successfully.",
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
        },
      });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Signin issues a JWT and sets it as a cookie. Notice this controller expects `req.user` to already exist; that implies a previous authentication step (likely a middleware such as Passport strategy or custom auth middleware) has validated the credentials and attached the user. The controller then signs a JWT containing the user id and email. The secret key `JWT_SECRET_KEY` is what protects the signature; if it leaks, attackers can forge tokens.The cookie is set with `res.cookie("jwt", token, cookieOptions)`. This is a session pattern: instead of returning the token for the frontend to store in localStorage, you store it as an HTTP-only cookie so the browser automatically sends it on future requests. This is generally safer against token theft via XSS, but you must pay attention to CSRF protections when using cookies. The response also returns basic user info in JSON, which the frontend can use for UI (username, email). */

const userControllerToGetProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const err = throwNewError(404, "No such user found");
      return next(err);
    }
    res.status(200).json({
      success: true,
      status: 200,
      message: "User found successfully.",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Get profile reads the current authenticated user. It uses `req.userId`, which should be set by your auth middleware after verifying the JWT. This demonstrates a common design: controllers do not re-parse JWTs; middleware does auth once and attaches identity to `req`, keeping controllers focused on business logic. If the user is not found, it generates a 404 error. On success it returns the user document. A future improvement is to omit sensitive fields (password hashes, internal flags) using `.select(...)` or schema settings. */

const userControllerToPatchProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      status: 200,
      message: "User updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Patch profile is currently a stub that returns success without updating DB. In REST terms, PATCH means partial update. When you implement it, you’ll typically validate allowed fields, then update `User` by id, and return the updated user. Leaving it as a stub is fine during early development as long as the frontend doesn’t rely on it for real updates. */

const userControllerToPatchPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId).select("+password");
    const passwordNotUpdated = await user.comparePassword(password);
    if (passwordNotUpdated)
      throw throwNewError(
        422,
        "Cannot use an current password to update password.",
      );
    user.set({ password: password });
    await user.save();
    res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Patch password updates the user’s password while preventing reuse of the current password. It loads the user with `.select("+password")`, which implies your schema marks password as `select: false` by default (good security practice). It uses a method `comparePassword`, which likely compares a plain password with the stored hash. If the password is the same, it throws a 422 (unprocessable entity). Otherwise it sets the new password and saves. Again, security depends on the User model hashing passwords on save. Also note: a real password change flow usually requires verifying the old password and enforcing password strength rules. */

const userControllerToLogoutProfile = (req, res, next) => {
  try {
    // the cookie is passed with a null token and set to expiere immediately
    res
      // .cookie("jwt", null, { expires: new Date(Date.now()) })
      .clearCookie("jwt", cookieOptions)
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Logged out successfully.",
      });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Logout clears the auth cookie. When using cookie-based JWT auth, “logging out” is mainly about removing the client’s token so it can’t be sent anymore. `clearCookie("jwt", cookieOptions)` tells the browser to remove that cookie (the options must match how it was set). This is why consistent cookieOptions are important. */

const userControllerToDeleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res
      .cookie("jwt", null, { expires: new Date(Date.now()) }) // this step is important because it makes sure that delete api is not misused by calling multiple delete calls for the same token and user id.
      .status(200)
      .json({
        success: true,
        status: 200,
        message: "Profiie deleted successfully.",
      });
  } catch (err) {
    next(err);
  }
};
/* Explanation: Delete profile removes the user document and also expires the JWT cookie. Deleting user data is an irreversible operation, so in real apps you often require re-authentication or confirmation. The comment about preventing misuse indicates you want to ensure subsequent delete requests with the same token do not succeed; clearing/expiring the cookie helps on the browser side, but if an attacker still has the token value, server-side invalidation (token blacklist or rotating secrets) would be needed. */

module.exports = {
  userControllerToSignup,
  userControllerToSignin,
  userControllerToGetProfile,
  userControllerToPatchProfile,
  userControllerToPatchPassword,
  userControllerToLogoutProfile,
  userControllerToDeleteProfile,
};
