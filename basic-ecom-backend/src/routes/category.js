const express = require("express");
const router = express.Router();
const { getAllCategoriesList } = require("../controllers");

router.get("/api/v1/categories", getAllCategoriesList);

module.exports = { categoryRouter: router };
