const SLOW_REQUEST_THRESHOLD_MS = 200;

function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const slowTag = duration >= SLOW_REQUEST_THRESHOLD_MS ? " SLOW" : "";
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms${slowTag}`);
  });
  next();
}

module.exports = logger;