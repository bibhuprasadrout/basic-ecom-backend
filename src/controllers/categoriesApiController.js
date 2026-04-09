const { Category } = require("../models/category");
/* Explanation: This controller file is responsible for category-related HTTP handlers in your API.Controllers in an Express app are usually functions with signature `(req, res, next)` that handle a specific route. They sit between routing (which decides *which* controller runs) and models/services (which do the actual data access and business logic). Here you import `Category`, which is a Mongoose model. A Mongoose model is a JavaScript representation of a MongoDB collection and provides methods like `find`, `findById`, `create`, etc. Under the hood, those methods translate into MongoDB queries and return Promises, which is why this controller is `async` and uses `await`. */
const getAllCategoriesList = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, status: 200, message: "Categories fetched successfully", data: categories });
  } catch (err) {
    next(err);
  }
};
/* Explanation: This handler implements the common “read all resources” endpoint pattern: it queries the database, then returns a JSON response. `Category.find()` with no filter means “return all documents in the categories collection”. In MongoDB terms, it’s a collection scan unless you add filters. The `res.status(200).json(...)` part sends a structured API response. This structure (success/status/message/data) is a design choice: it makes frontend handling predictable because responses share a consistent shape. Error handling uses `next(err)`, which passes the error to Express’s centralized error middleware (your `errorHandler`). This is a best practice because it keeps controller code simple and ensures errors are formatted consistently across the API. */
module.exports = { getAllCategoriesList };
/* Explanation: Exporting controller functions lets your routes layer mount them on specific endpoints. This separation of concerns makes the project scalable: routes define URLs and middleware, controllers define request handling, models define data, and utilities define shared helpers. */
