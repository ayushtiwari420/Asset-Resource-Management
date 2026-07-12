const sendSuccess = (res, message, data = null, statusCode = 200, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, message, data = null) =>
  sendSuccess(res, message, data, 201);

const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendPaginated = (res, message, data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return sendSuccess(res, message, data, 200, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
};

module.exports = { sendSuccess, sendCreated, sendError, sendPaginated };
