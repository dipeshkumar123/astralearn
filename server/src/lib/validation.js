const { z } = require('zod');

function formatZodError(error) {
  const firstIssue = error?.issues?.[0];
  return firstIssue?.message || 'Invalid request payload';
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: formatZodError(result.error),
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  z,
  validateBody,
};
