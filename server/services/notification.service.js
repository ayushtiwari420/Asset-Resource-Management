const Notification = require('../models/Notification.model');

const createNotification = async ({ recipientId, type, title, message, referenceId, referenceModel }) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      referenceId: referenceId || null,
      referenceModel: referenceModel || null,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const docs = notifications.map((n) => ({
      recipient: n.recipientId,
      type: n.type,
      title: n.title,
      message: n.message,
      referenceId: n.referenceId || null,
      referenceModel: n.referenceModel || null,
    }));
    return await Notification.insertMany(docs, { ordered: false });
  } catch (error) {
    console.error('Failed to create bulk notifications:', error.message);
  }
};

const markAllRead = async (userId) => {
  return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

module.exports = { createNotification, createBulkNotifications, markAllRead, getUnreadCount };
