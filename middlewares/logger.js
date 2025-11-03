// middlewares/logger.js
// Simple request logger: method, url, time, duration
module.exports = function logger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;

  // When response finishes, print duration and status
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} -> ${res.statusCode} (${duration}ms)`);
  });

  next(); // pass control to next middleware/handler
};
