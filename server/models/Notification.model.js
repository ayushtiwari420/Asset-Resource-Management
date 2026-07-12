const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'allocation_success',
  'allocation_returned',
  'booking_pending',
  'booking_approved',
  'booking_rejected',
  'booking_reminder',
  'transfer_pending',
  'transfer_approved',
  'transfer_rejected',
  'maintenance_pending',
  'maintenance_approved',
  'maintenance_completed',
  'audit_assigned',
  'overdue_return',
  'general',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceModel: {
      type: String,
      enum: ['Asset', 'Allocation', 'Booking', 'TransferRequest', 'MaintenanceRequest', 'AuditCycle'],
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
