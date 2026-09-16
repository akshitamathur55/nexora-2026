// SRS section 6: consistent JSON error shape, no stack traces leaked to the client.

function errorHandler(err, req, res, next) {
  console.error(err); // full detail stays in server logs only

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
