const mongoose = require('mongoose');

const auditCycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Audit cycle name is required'],
      trim: true,
    },

    scopeType: {
      type: String,
      enum: ['Department', 'Location'],
      default: 'Department',
    },
    scopeValue: {
      type: String,
      trim: true,
    },

    startDate: { type: Date },
    endDate: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed', 'draft', 'active', 'completed'],
      default: 'Draft',
    },

    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],

    totalAssets:    { type: Number, default: 0 },
    verifiedAssets: { type: Number, default: 0 },
    discrepancies:  { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

auditCycleSchema.index({ status: 1 });
auditCycleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
