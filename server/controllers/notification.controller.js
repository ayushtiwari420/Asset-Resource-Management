const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Notification = require('../models/Notification.model');
const notificationService = require('../services/notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    notificationService.getUnreadCount(req.user._id),
  ]);

  sendSuccess(res, 'Notifications fetched', notifications, 200, {
    page, limit, total, unreadCount,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  sendSuccess(res, 'Notification marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  sendSuccess(res, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  sendSuccess(res, 'Notification deleted');
});

module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification };
