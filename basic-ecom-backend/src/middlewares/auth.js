const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: `../../.env.${process.env.NODE_ENV}`,
});
const { throwNewError } = require("../utils");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // a manual way of getting the token but not recomended practice
    // const parser = cookieParser(process.env.JWT_SECRET_KEY);
    // const token = parser(req, res, (err) => {
    //   if (err) return next(err);
    //   return req.cookies.jwt;
    // });
    if (!token) {
      const err = throwNewError(401, "Auth failed: Invalid or expired token");
      return next(err);
    }
    const tokenMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = tokenMessage.id;
    req.userEmail = tokenMessage.email;
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = { authMiddleware };

//
//
//
// lesson for dev, a req usually has all the following informations...
// app.post("/api/users/:id", (req, res) => {
//   console.log(  req.method  ); // "POST"
//   console.log(  req.path  ); // "/api/users/123"
//   console.log(  req.params  .id); // "123"
//   console.log(  req.query  .active); // e.g. "true"
//   console.log(  req.headers  ); // all headers
//   console.log(  req.body  ); // parsed JSON body
//   console.log(  req.cookies  .jwt); // cookie if cookie-parser is used
// });
