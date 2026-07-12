const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ActivityLog = require('../models/ActivityLog.model');

const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 30;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.module) filter.module = req.query.module;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.userId) filter.user = req.query.userId;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  sendSuccess(res, 'Activity logs fetched', logs, 200, { page, limit, total });
});

module.exports = { getActivityLogs };
