const throwNewError = (status = 500, message = "Unexpected error occured!") => {
  const err = new Error(message);
  err.status = status;
  return err;
};
/* Explanation: This block defines a tiny utility for creating “HTTP-aware” errors. In JavaScript, `Error` objects normally carry a message and a stack trace, but they don’t have an HTTP status code by default. In Express apps, it’s common to attach a `status` field to an Error so the global error handler can decide whether to respond with 400, 401, 404, 500, etc.This helps you keep controller and middleware code readable: instead of manually building a response everywhere you detect a problem, you can `throw throwNewError(404, "Not found")` and let one centralized place format the HTTP response. This is also a form of “separation of concerns”: business logic decides *what* went wrong; error middleware decides *how* to represent that failure to the client. */
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
};
/* Explanation: This is your global Express error-handling middleware. Express detects an error handler by its signature: it has four parameters `(err, req, res, next)`. When a controller throws or calls `next(err)`, Express skips normal middleware and calls this function.Your handler turns an Error into a JSON response with three key fields: `success: false` (a client-friendly boolean), `status` (HTTP status), and `message` (human-readable explanation). The code uses fallbacks so that even unexpected errors become a 500 response. This creates consistent error shapes for the frontend, which is important: predictable error payloads make it easier to show toast messages, handle auth failures, and implement retries. A future improvement could include an error code, request id, or stack trace only in development, but we keep behavior unchanged. */
module.exports = { throwNewError, errorHandler };
/* Explanation: Exporting these two functions makes them reusable across the backend. You import `throwNewError` in controllers/middlewares to create errors, and you register `errorHandler` at the end of the Express middleware chain to send responses. */
