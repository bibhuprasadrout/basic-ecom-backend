const { Product } = require("../models/products");
const { throwNewError } = require("../utils");

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
      meta: {
        usage: "You can send query params: category, page, limit",
        example: "/api/products?category=shoes&page=2&limit=10",
      },
    });
  } catch (err) {
    next(err);
  }
};

const getNRandomProducts = async (req, res, next) => {
  try {
    const { randomProductsCount, discountPercentage } = req.query;

    // handle the discount provided in request
    let discount = Math.floor(Number(discountPercentage) * 100) / 100 || 11;
    if (discount > 100)
      throw throwNewError(
        400,
        "Discount cannot exceed 100%. Provide a valid discount percentage."
      );
    const maxDiscountInCollection = await Product.aggregate([
      {
        $group: {
          _id: null,
          maxDiscount: { $max: "$discountPercentage" },
        },
      },
    ]);
    const maxDiscount = maxDiscountInCollection[0].maxDiscount;
    if (!maxDiscount)
      return res.status(204).json({
        success: true,
        status: 204,
        message: "We do not have any discounts for the time being.",
      });
    if (discount > maxDiscount)
      throw throwNewError(
        400,
        `Discount percentage do not exceed ${maxDiscount} for the time being.`
      );
    if (discount === maxDiscount)
      discount = Math.floor((maxDiscount - 0.01) * 100) / 100;

    // handling count of random products to fetch and respond
    const productsCount = Math.floor(Number(randomProductsCount)) || 11;
    const totalProductsCount = await Product.countDocuments();
    if (!totalProductsCount)
      throw throwNewError(
        404,
        "We are restocking and will be up and live in a some time."
      );
    if (productsCount > totalProductsCount)
      throw throwNewError(
        400,
        "The volume of products fetched exceeds actual product types in stock."
      );
    if (productsCount > 11)
      throw throwNewError(400, "Can not fetch more than 11 random products."); // just having a little fun with the user if they actually try and fetch more volume than our stock...hehehe!
    const products = await Product.aggregate([
      { $match: { discountPercentage: { $gt: discount } } },
      {
        // $sample fetches a set of random products.
        $sample: { size: productsCount },
      },
    ]);
    if (!productsCount)
      throw throwNewError(
        500,
        "Could not process the request due to internal server error. Please check if the collection is sharded, thus leading to an error."
      );
    res.status(200).json({
      success: true,
      status: 200,
      message: `${productsCount} random products fetched successfully.`,
      data: products,
      meta: {
        usage: "You can send only a number",
        example: "/api/products/random?randomProductsCount=10",
      },
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

module.exports = {
  getAllProducts,
  getNRandomProducts,
  getProductById,
  getProductByName,
};
