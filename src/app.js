const express = require("express");
const mongoose = require("mongoose");
require("./models/cart.js");
require("./models/category.js");
require("./models/products.js");
require("./models/user.js");
require("./models/wishlist.js");
const cors = require("cors");
require("dotenv").config();
/* Explanation: This first block is about Node.js modules, dependencies, and configuration loading.This backend uses CommonJS modules (`require(...)`) rather than ESM (`import ... from ...`). In Node.js, CommonJS historically has been the default module system: `require("express")` loads the `express` package from `node_modules`, and `require("./something")` loads a local file. You’ll often see both styles across projects; which one you use depends on `package.json` settings and Node version/tooling. `express` is the HTTP server framework; it provides `app.use(...)` middleware pipelines, routing (`app.get`, `app.post`, etc.), and request/response abstractions. `mongoose` is an ODM (Object Data Modeling) library for MongoDB: it manages database connections and lets you define schemas/models in JavaScript. `cors` is middleware that sets HTTP headers so browsers allow cross-origin requests (more detail below). `dotenv` loads environment variables from a `.env` file into `process.env` so you can keep secrets and environment-specific settings out of code.Important concept: `process.env` is just a key/value object that Node exposes. It’s the standard way to configure a server without hardcoding secrets. When you call `require("dotenv").config()`, dotenv reads a file (by default `.env` in your working directory) and populates `process.env`. In production, environment variables typically come from the hosting platform (Docker, cloud, CI/CD), so dotenv is mainly a local/dev convenience. */
const { connectDB } = require("./config/database.js");
const { authMiddleware } = require("./middlewares");
const {
  authRouter,
  userRouter,
  categoryRouter,
  productRouter,
  cartRouter,
  wishlistRouter,
  checkoutRouter,
} = require("./routes");
const { errorHandler } = require("./utils");
/* Explanation: This second block imports your application-specific modules (your own code).A good mental model is: Express itself is just a “pipeline builder”; your app-specific modules define what the pipeline does. `connectDB` is your database bootstrapper (likely calling `mongoose.connect(...)`). `authMiddleware` is a reusable piece of logic that runs before certain routes; middleware in Express is simply a function `(req, res, next) => { ... }` that can (a) modify the request, (b) end the response, or (c) call `next()` to continue. In auth middleware, you commonly read cookies/headers, validate a JWT/session, and attach a user object to `req` for later handlers to use. The routers (`authRouter`, `userRouter`, etc.) are modular route tables: each router defines endpoints for a feature area (auth, products, cart, etc.). `errorHandler` is your centralized error middleware; in Express, error handlers are a special kind of middleware with signature `(err, req, res, next)` and they must be registered at the end so they can catch errors from earlier middleware/routes. */
const app = express();
const port = process.env.PORT;
/* Explanation: This block creates the Express application instance.`app` is the central object that holds your middleware stack and routing table. Think of it as an ordered list of “functions that run for a request”. `port` is read from the environment; this allows different environments to choose ports without code changes. A key operational concept: servers should be configured from outside (environment variables) so the same build can run in dev, staging, and production. */
app.use(express.json());
/* Explanation: This middleware enables JSON request bodies. In HTTP, a request body is just bytes. `express.json()` parses those bytes when `Content-Type: application/json` and assigns the result to `req.body`. Without this, `req.body` would be undefined for JSON payloads, and your POST/PUT endpoints would not see client data. Middleware order matters: you must register body parsing before routes that need it. */
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
}
if (process.env.NODE_ENV === "production") {
  app.use(cors());
}
/* Explanation: This block configures CORS, which is a browser security policy issue, not a backend-to-backend issue.Same-origin policy means browsers restrict JavaScript from calling APIs on a different origin (scheme+host+port) unless the server explicitly allows it via CORS headers. Your frontend dev server runs at `http://localhost:5173`, while your backend might run at `http://localhost:PORT`, so they are different origins. When you enable `cors({ origin: "...", credentials: true })`, Express adds headers that tell the browser: “it’s OK for that origin to call this API, and it’s OK to include credentials (cookies/authorization headers).” This is required if you use cookie-based auth (`withCredentials: true` on the frontend). In production, you currently call `cors()` with defaults, which effectively allows requests from anywhere (depending on the cors package defaults). That can be acceptable for public APIs, but for private APIs it’s usually better to restrict allowed origins. The conditional on `NODE_ENV` is an environment-based configuration switch: you loosen restrictions for local development and tighten them for production. */
const cookieParser = require("cookie-parser");
if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: `../.env.${process.env.NODE_ENV}` });
}
app.use(cookieParser(process.env.JWT_SECRET_KEY));
/* Explanation: This block enables cookie parsing and (optionally) cookie signing.`cookie-parser` reads the `Cookie` header on incoming requests and populates `req.cookies` (and `req.signedCookies` if you provide a secret). This matters for authentication because many apps store a session id or a JWT in an HTTP-only cookie. When you pass a secret key (`process.env.JWT_SECRET_KEY`), cookies can be “signed” so the server can detect tampering: the cookie value includes a signature, and `cookie-parser` verifies it and only exposes signed cookies via `req.signedCookies`.Important note: `dotenv.config()` is called twice in this file (once at the top and once in this dev-only block). That’s not harmful, but it’s unusual. The dev-only config with a path suggests you want environment-specific `.env` files like `.env.development`. The general principle is: load configuration once, as early as possible, and keep it consistent. You can later refactor this to a single place if you want, but for now we keep behavior unchanged. */
app.use("/test", (req, res) => {
  res.status(200).send("Hello from server!");
});
/* Explanation: This is a simple health/test endpoint. It is useful for quickly verifying that the server process is running and that routing works. Health endpoints are also used by deployment platforms and load balancers to check if an instance is alive. Because it does not depend on the database or auth, it can respond even when other parts are broken, which makes it a good “is the server up?” signal. */
(async () => {
  try {
    await connectDB();
    console.log("Connection established");
    const server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Try a different port.`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
      }
    });
  } catch (err) {
    console.error("Some error occured while connecting to DB:", err);
  }
})();
/* Explanation: This block is the startup sequence of your server, implemented as an IIFE (Immediately Invoked Function Expression).An IIFE is a JavaScript pattern where you define a function and call it immediately. Here, it’s an async IIFE so you can use `await` at the top level even though CommonJS files don’t support top-level await in the same way ESM does. The server first calls `connectDB()` to establish a database connection. Only after the DB connection succeeds do you start listening for HTTP requests (`app.listen`). This ordering is important: it prevents the app from accepting requests it can’t satisfy (for example, endpoints that require DB access).The `server.on("error", ...)` handler listens for low-level server errors. `EADDRINUSE` is a common one: the port is already taken. Exiting with code 1 is a standard way to fail fast so you notice the issue. Other errors are logged. In more robust setups, you might also handle graceful shutdown (SIGINT/SIGTERM), close the server, and close the DB connection cleanly. */
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongoose reconnected after disconnect");
});
/* Explanation: This block attaches listeners to Mongoose’s connection events. Mongoose maintains an internal connection state machine; these events are emitted when the connection is established, lost, or restored. Logging them is useful for diagnosing intermittent network issues (for example, if MongoDB restarts). In production, you might route these logs into a logging system and add alerts when frequent disconnects occur. This is an example of “observability”: making internal system state visible so you can operate and debug the service. */
app.use("/api/v1/auth", authMiddleware);
/* Explanation: This line registers your auth middleware for a specific URL prefix. Express runs middleware in order, and `app.use("/api/v1/auth", ...)` means: for any request whose path starts with `/api/v1/auth`, run `authMiddleware` first. This is how you enforce authentication policies centrally. A potential naming confusion: `"/api/v1/auth"` often suggests endpoints like login/signup, which are usually public; in your codebase, it might instead mean “authenticated routes” or “auth-required routes”. We keep it as-is, but conceptually you might later rename the prefix or mount the middleware on specific routers rather than on a path that looks like public auth endpoints. */
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", wishlistRouter);
app.use("/", checkoutRouter);
/* Explanation: This block mounts your feature routers into the app. A router is a mini Express app that contains related routes. Mounting them at `"/"` means the router definitions themselves contain the actual prefixes (for example, `/api/v1/products` inside `productRouter`). This modular structure improves maintainability: each feature owns its endpoints and controllers, and `app.js` just assembles them. Order matters if routers share overlapping paths; Express matches in registration order. If two routers define the same route, the first one wins unless it calls `next()`. Keeping routes separated by feature prefixes reduces the chance of conflicts. */
app.use(errorHandler);
/* Explanation: This is the global error-handling middleware, and it should be last. In Express, errors can happen in middleware or route handlers. If you `throw` inside an async handler or call `next(err)`, Express will skip normal middleware and look for the next error handler. By putting `errorHandler` at the end, you ensure it can catch errors from any route above and convert them into consistent HTTP responses (status codes, JSON error bodies, etc.). This is important for frontend developers too: consistent error shapes make it easier to display error messages and handle edge cases. */
