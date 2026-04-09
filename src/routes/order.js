const express = require("express");
const router = express.Router();
const { createPendingOrder } = require("../controllers/orderApiControllers");

router.post("/api/v1/order/create", createPendingOrder);

module.exports = { orderRouter: router };
