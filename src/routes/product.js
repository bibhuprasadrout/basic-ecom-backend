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
