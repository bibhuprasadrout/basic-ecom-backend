const jwt = require("jsonwebtoken");
require("dotenv").config({ path: `../../.env.${process.env.NODE_ENV}` });
const { throwNewError } = require("../utils");
/* Explanation: This middleware is the authentication gate for protected routes. In Express, a middleware function runs before your controller and can decide to continue (`next()`), reject the request (send a response), or raise an error (`next(err)`).The job of this middleware is: (1) extract the JWT token from the request cookies, (2) verify the token’s signature and validity, and (3) attach identity information to the request object (`req`) so downstream handlers/controllers can trust it. This is a standard layering pattern: middleware proves identity once; controllers use `req.userId` without caring about JWT details.Security concepts involved: a JWT is a signed token; `jwt.verify` checks the signature using `JWT_SECRET_KEY`. If the token is missing or invalid/expired, the request should be treated as unauthenticated and blocked (typically 401). Cookie-based JWT auth relies on `cookie-parser` having already populated `req.cookies`; that’s why `cookieParser(...)` is registered in `app.js` before routes. */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // a manual way of getting the token but not recomended practice
    // const parser = cookieParser(process.env.JWT_SECRET_KEY);
    // const token = parser(req, res, (err) => {
    //   if (err) return next(err);
    //   return req.cookies.jwt;
    // });
    if (!token)
      return next(throwNewError(401, "Auth failed: Invalid or expired token"));
    const tokenMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = tokenMessage.id;
    req.userEmail = tokenMessage.email;
    next();
  } catch (err) {
    next(err);
  }
};
/* Explanation: This block is the actual enforcement logic. If there is no token cookie, it forwards a 401 error to the global error handler. If there is a token, it verifies the signature and decodes the payload. On success, it writes `req.userId` and `req.userEmail`, which are request-scoped values used by controllers (profile, wishlist, etc.).If verification fails (expired token, wrong secret, malformed token), `jwt.verify` throws and the catch forwards the error. In production, you might want to translate JWT errors into a clean 401 message instead of leaking internal error strings, but we keep behavior unchanged. */
module.exports = { authMiddleware };

//
//
//
// lesson for dev, a req usually has all the following informations...
// app.post("/api/users/:id", (req, res) => {
//   console.log(  req.method  ); // "POST"
//   console.log(  req.path  ); // "/api/users/123"
//   console.log(  req.params.id); // "123"
//   console.log(  req.query.active); // e.g. "true"
//   console.log(  req.headers  ); // all headers
//   console.log(  req.body  ); // parsed JSON body
//   console.log(  req.cookies.jwt); // cookie if cookie-parser is used
// });
