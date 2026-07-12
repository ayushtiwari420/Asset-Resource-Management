const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return sendError(res, 'Validation failed', 422, formattedErrors);
  }
  next();
};

module.exports = { validate };
