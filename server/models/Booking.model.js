const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
      alias: 'assetId',
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'bookedBy is required'],
      alias: 'bookedById',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    startTime: {
      type: Date,
      required: [true, 'startTime is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'endTime is required'],
    },

    purpose: {
      type: String,
      required: [true, 'Booking purpose is required'],
      maxlength: [500, 'Purpose cannot exceed 500 characters'],
    },

    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'Upcoming',
    },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: { type: String },
    approvedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.virtual('startDate')
  .get(function () { return this.startTime; })
  .set(function (value) { this.startTime = value; });
bookingSchema.virtual('endDate')
  .get(function () { return this.endTime; })
  .set(function (value) { this.endTime = value; });

bookingSchema.index({ asset: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ bookedBy: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1 });
bookingSchema.index({ endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
