const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
      alias: 'assetId',
    },

    allocatedToType: {
      type: String,
      enum: ['Employee', 'Department'],
      required: [true, 'allocatedToType is required'],
      default: 'Employee',
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      alias: 'employeeId',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      alias: 'departmentId',
    },

    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },

    returnDueDate: { type: Date, default: null, alias: 'expectedReturnDate' },
    returnedAt: { type: Date, default: null, alias: 'actualReturnDate' },

    returnAcceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Active', 'Returned', 'Rejected', 'active', 'returned', 'overdue'],
      default: 'Active',
    },

    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Poor'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    returnNotes: { type: String },

    checkInNotes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

allocationSchema.pre('validate', function () {
  if (this.allocatedToType === 'Employee' && !this.employee) {
    this.invalidate('employee', 'Employee is required for employee allocations');
  }
  if (this.allocatedToType === 'Department' && !this.department) {
    this.invalidate('department', 'Department is required for department allocations');
  }
});

allocationSchema.index({ asset: 1, status: 1 });
allocationSchema.index({ employee: 1 });
allocationSchema.index({ department: 1 });
allocationSchema.index({ status: 1 });
allocationSchema.index({ returnDueDate: 1, status: 1 });
allocationSchema.index({ asset: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('Allocation', allocationSchema);
