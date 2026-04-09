const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getNRandomProducts,
  getProductById,
  getProductByName,
} = require("../controllers");
router.get("/api/v1/products", getAllProducts);
router.get("/api/v1/products/random", getNRandomProducts);
router.get("/api/v1/products/:id", getProductById);
router.get("/api/v1/products/productName/:productName", getProductByName);
module.exports = { productRouter: router };
/* Explanation: This route module maps HTTP endpoints (URLs + methods) to controller functions for products.Express routers work like this: you create a `router`, define routes on it (`router.get`, `router.post`, etc.), and then export it so the main app can mount it using `app.use(...)`. This router exports `productRouter`, which is mounted at `"/"` in `app.js`, so the full paths here are exactly what clients call (e.g. `/api/v1/products`).Each route line has three parts: HTTP method, path, handler. For example, `router.get("/api/v1/products/:id", getProductById)` means: when the server receives a GET request whose path matches `/api/v1/products/<something>`, extract `<something>` as a path parameter called `id` and call `getProductById(req, res, next)`. The controller can then read `req.params.id`.This file is intentionally “thin”: it does not contain business logic or database calls. It only wires URL design to controller functions. Keeping routes thin makes your API easier to maintain: you can add middleware (auth, validation, rate limiting) here without touching controller logic. */
