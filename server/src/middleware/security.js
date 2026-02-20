let requestCountByKey = new Map();

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function attachRequestId(req, res, next) {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

function apiRateLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'test' || process.env.TEST_AUTH === '1') {
    return next();
  }

  const windowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60);
  const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120);
  const key = `${req.ip}:${Math.floor(nowInSeconds() / windowSeconds)}`;
  const current = requestCountByKey.get(key) || 0;

  if (current >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests. Please retry shortly.',
      requestId: req.requestId,
    });
  }

  requestCountByKey.set(key, current + 1);

  // Prevent unbounded growth from old keys.
  if (requestCountByKey.size > 5000) {
    requestCountByKey = new Map(
      [...requestCountByKey.entries()].filter(([bucket]) => bucket.endsWith(`:${Math.floor(nowInSeconds() / windowSeconds)}`))
    );
  }

  next();
}

module.exports = {
  attachRequestId,
  securityHeaders,
  apiRateLimiter,
};
