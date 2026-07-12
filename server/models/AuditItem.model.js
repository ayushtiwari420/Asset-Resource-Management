const mongoose = require('mongoose');

const auditItemSchema = new mongoose.Schema(
  {
    auditCycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: [true, 'auditCycle is required'],
      alias: 'auditCycleId',
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'asset is required'],
      alias: 'assetId',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      alias: 'auditorId',
    },

    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Missing', 'Damaged', 'pending', 'verified', 'missing', 'discrepancy'],
      default: 'Pending',
      alias: 'verificationStatus',
    },

    expectedLocation: { type: String },
    actualLocation:   { type: String },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor'],
    },
    notes:      { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

auditItemSchema.index({ auditCycle: 1 });
auditItemSchema.index({ asset: 1 });
auditItemSchema.index({ status: 1 });
auditItemSchema.index({ auditCycle: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('AuditItem', auditItemSchema);
