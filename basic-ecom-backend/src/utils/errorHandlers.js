const throwNewError = (status = 500, message = "Unexpected error occured!") => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
};
module.exports = { throwNewError, errorHandler };
