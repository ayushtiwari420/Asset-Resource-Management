const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
      alias: 'assetId',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'reportedBy is required'],
      alias: 'raisedById',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical', 'low', 'medium', 'high', 'critical'],
      required: [true, 'Priority is required'],
      default: 'Medium',
    },

    type: {
      type: String,
      enum: ['preventive', 'corrective', 'inspection'],
      default: 'corrective',
    },

    status: {
      type: String,
      enum: [
        'Pending', 'Approved', 'Rejected', 'Technician_Assigned',
        'In_Progress', 'Resolved', 'Cancelled',
        'pending', 'in-progress', 'completed', 'cancelled',
      ],
      default: 'Pending',
    },

    estimatedCost: { type: Number, min: 0 },
    actualCost:    { type: Number, min: 0 },
    scheduledDate: { type: Date },
    startedAt:     { type: Date },
    completedAt:   { type: Date },
    resolutionNotes: { type: String },
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ asset: 1 });
maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ priority: 1 });
maintenanceRequestSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
