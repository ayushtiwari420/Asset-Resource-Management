const mongoose = require('mongoose');

const transferRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    fromDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    toDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: [true, 'Transfer reason is required'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    approvalNotes: {
      type: String,
      maxlength: [1000, 'Approval notes cannot exceed 1000 characters'],
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

transferRequestSchema.index({ asset: 1 });
transferRequestSchema.index({ status: 1 });
transferRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('TransferRequest', transferRequestSchema);
