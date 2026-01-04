const { Product } = require("../models/products");

const getAllProducts = async (req, res, next) => {
  try {
    const { category, page, limit } = req.query;
    let prodCountPerPage = (limit > 10 ? 5 : limit) || 3;
    const skip = (page - 1) * prodCountPerPage || 0;
    const productCategory = category || "";
    const products = await Product.find({ category: productCategory })
      .skip(skip)
      .limit(prodCountPerPage);
    console.log(products);
    res.status(200).json({
      success: true,
      status: 200,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json({
      success: true,
      status: 200,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};
const getProductByName = async (req, res, next) => {
  try {
    const { productName } = req.params;
    const product = await Product.find({ title: productName });
    console.log(product);
    res.status(200).json({
      success: true,
      status: 200,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllProducts, getProductById, getProductByName };
