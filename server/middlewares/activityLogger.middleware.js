const ActivityLog = require('../models/ActivityLog.model');

const logActivity = (action, module, descriptionFn) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (body && body.success && req.user) {
        try {
          const description =
            typeof descriptionFn === 'function'
              ? descriptionFn(req, body)
              : descriptionFn;

          await ActivityLog.create({
            user: req.user._id,
            action,
            module,
            description,
            entityId: body.data?._id || req.params?.id || null,
            entityType: module,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
          });
        } catch (logError) {
          console.error('Activity log error:', logError.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = { logActivity };
