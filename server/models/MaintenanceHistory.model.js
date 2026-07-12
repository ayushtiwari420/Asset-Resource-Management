const mongoose = require('mongoose');

const maintenanceHistorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    maintenanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
    },
    performedBy: {
      type: String,
      required: true,
    },
    performedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    workDone: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    datePerformed: {
      type: Date,
      required: true,
    },
    nextScheduled: {
      type: Date,
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor'],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

maintenanceHistorySchema.index({ asset: 1 });
maintenanceHistorySchema.index({ datePerformed: 1 });

module.exports = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);
