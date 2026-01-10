const express = require("express");
const router = express.Router();
const { getAllCategoriesList } = require("../controllers");

router.get("/api/v1/categories", getAllCategoriesList);
// TODO: Later make sure if there are more than 30 categories, we need to send 30 at a time whie observing the viewporrt.

module.exports = { categoryRouter: router };
