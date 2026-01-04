const { Category } = require("../models/category");
const getAllCategoriesList = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      status: 200,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = { getAllCategoriesList };
