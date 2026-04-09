const { Product } = require("../models/products");
const { throwNewError } = require("../utils");
/* Explanation: This controller module defines product-related HTTP handlers. It uses a Mongoose model to query MongoDB and returns JSON responses for the frontend. `Product` is the model that represents your products collection. `throwNewError` is a utility that creates a standardized error (usually with a status code + message) so your global error handler can translate it into a consistent HTTP response. */
const getAllProducts = async (req, res, next) => {
  try {
    // 1. Extract and Sanitize (Convert strings to numbers)
    const { category, page, limit, sort } = req.query;

    const currentPage = Math.max(1, parseInt(page) || 1);
    const prodCountPerPage = Math.min(50, parseInt(limit) || 12); // Cap limit at 50 for security
    const skip = (currentPage - 1) * prodCountPerPage;

    // 2. Dynamic Query Building
    const query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    // 3. Dynamic Sorting
    // let sortOptions = { createdAt: -1 }; // Default: Newest
    // if (sort === "price_asc") sortOptions = { price: 1 };
    // if (sort === "price_desc") sortOptions = { price: -1 };
    // if (sort === "rating_desc") sortOptions = { rating: -1 };

    // 4. Execute Query & Get Total Count (for frontend logic)
    // We run these in parallel for better performance
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        // .sort(sortOptions)
        .skip(skip)
        .limit(prodCountPerPage),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      status: 200,
      message: products.length > 0 ? "Products fetched." : "No products found.",
      data: products,
      pagination: {
        totalProducts,
        currentPage,
        hasNextPage: skip + products.length < totalProducts,
        totalPages: Math.ceil(totalProducts / prodCountPerPage),
      },
      meta: {
        usage: "You can send query params: category, page, limit",
        example: "/api/products?category=shoes&page=2&limit=10",
      },
    });
  } catch (err) {
    next(err);
  }
};
/* Explanation: `getAllProducts` is a classic “list endpoint” with optional filtering and pagination. `req.query` holds query-string parameters (everything after `?` in the URL). Pagination is implemented using `skip` (offset) and `limit` (page size). The formula \(skip = (page - 1) \times limit\) is the simplest pagination scheme. It’s good for small to medium datasets; for very large datasets it can get slow at high page numbers, and cursor-based pagination becomes more efficient.Important subtlety: query params arrive as strings, so comparisons like `limit > 10` rely on JavaScript type coercion. That works most of the time, but converting with `Number(limit)` is more explicit. Your current business rule clamps page size when `limit > 10` by using 5, and defaults to 3 when no limit is provided. The response contains a `meta` usage hint, which acts like lightweight documentation for API consumers. Errors are passed to `next(err)` so the global error handler formats them consistently. */

const getNRandomProducts = async (req, res, next) => {
  try {
    const { randomProductsCount, discountPercentage } = req.query;
    let discount = Math.floor(Number(discountPercentage) * 100) / 100 || 11;
    if (discount > 100)
      throw throwNewError(
        400,
        "Discount cannot exceed 100%. Provide a valid discount percentage.",
      );
    const maxDiscountInCollection = await Product.aggregate([
      { $group: { _id: null, maxDiscount: { $max: "$discountPercentage" } } },
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
        `Discount percentage do not exceed ${maxDiscount} for the time being.`,
      );
    if (discount === maxDiscount)
      discount = Math.floor((maxDiscount - 0.01) * 100) / 100;
    const productsCount = Math.floor(Number(randomProductsCount)) || 11;
    const totalProductsCount = await Product.countDocuments();
    if (!totalProductsCount)
      throw throwNewError(
        404,
        "We are restocking and will be up and live in a some time.",
      );
    if (productsCount > totalProductsCount)
      throw throwNewError(
        400,
        "The volume of products fetched exceeds actual product types in stock.",
      );
    if (productsCount > 11)
      throw throwNewError(400, "Can not fetch more than 11 random products.");
    const products = await Product.aggregate([
      { $match: { discountPercentage: { $gt: discount } } },
      { $sample: { size: productsCount } },
    ]);
    if (!productsCount)
      throw throwNewError(
        500,
        "Could not process the request due to internal server error. Please check if the collection is sharded, thus leading to an error.",
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
/* Explanation: `getNRandomProducts` demonstrates validation + aggregation + randomness at the database layer. This endpoint tries to return a random set of discounted products. First, it normalizes and validates `discountPercentage` so it stays within meaningful bounds (0–100 and also within the max available discount in the DB). It finds the max discount using a MongoDB aggregation pipeline with `$group` and `$max`.Then it validates the requested random sample size (`randomProductsCount`), checks the total number of products, and enforces a maximum of 11. After validation, it runs another aggregation: `$match` filters discounted products and `$sample` returns a random subset. Doing randomness in MongoDB avoids fetching many documents and randomizing in Node memory. This endpoint also shows how you can encode “product rules” at the API layer (like max count) to protect the database and provide predictable UX for clients. */

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
/* Explanation: `getProductById` fetches a single product using the `id` route param. This endpoint is the backend counterpart of frontend routes like `/products/:id`. `findById` is a convenience method for querying `_id`. Currently, the handler always returns 200 even if the product is null; a future improvement is to return 404 when not found, but we keep behavior unchanged. */
const getProductByName = async (req, res, next) => {
  try {
    const { productName } = req.params;
    const product = await Product.find({ title: productName });
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
/* Explanation: `getProductByName` does an exact-match query on the `title` field. This is a very literal search: case sensitivity and partial matches depend on your MongoDB collation and schema, and users usually expect fuzzy search. It returns an array because multiple products could share a title. This is fine as a simple API, but long-term you may want a proper search endpoint. */
module.exports = {
  getAllProducts,
  getNRandomProducts,
  getProductById,
  getProductByName,
};
/* Explanation: Exporting these handlers makes them usable by your routes layer. Keeping controllers small and composable makes it easier to test and to evolve your API. */
/* Explanation: The large commented Cloudinary upload snippet that used to live here has been removed on purpose. Even if code is commented out, committing real credentials (API keys/secrets) into source files is a security risk: it can leak through git history, backups, or simple copy/paste. If you need asset upload tooling, it should live in a separate script with credentials loaded from environment variables, never hardcoded. */
