const { sendError } = require('../utils/apiResponse');
const { normalizeRole } = require('../models/User.model');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const allowedRoles = roles.map(normalizeRole);
    if (!allowedRoles.includes(normalizeRole(req.user.role))) {
      return sendError(
        res,
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

const authorizeOwnerOrRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const isOwner = req.user._id.toString() === req.params.id;
    const hasRole = roles.map(normalizeRole).includes(normalizeRole(req.user.role));

    if (!isOwner && !hasRole) {
      return sendError(res, 'Access denied. You do not own this resource and lack the required role.', 403);
    }

    next();
  };
};

module.exports = { authorize, authorizeOwnerOrRole };
