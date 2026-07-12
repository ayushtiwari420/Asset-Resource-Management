const mongoose = require('mongoose');
const Counter = require('./Counter.model');

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Under_Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged'];

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Asset category is required'],
      alias: 'categoryId',
    },
    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition date is required'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition cost is required'],
      min: 0,
    },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number, min: 0 },
    currentValue: { type: Number, min: 0 },
    vendor: { type: String, trim: true },
    warrantyExpiry: { type: Date },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: 'Available',
    },
    condition: {
      type: String,
      enum: ASSET_CONDITIONS,
      required: [true, 'Asset condition is required'],
      default: 'Good',
    },
    location: {
      type: String,
      required: [true, 'Asset location is required'],
      trim: true,
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    images: [{ url: String, publicId: String }],
    qrCode: { type: String },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

assetSchema.pre('validate', async function () {
  if (!this.acquisitionDate && this.purchaseDate) this.acquisitionDate = this.purchaseDate;
  if (!this.acquisitionCost && this.purchasePrice !== undefined) this.acquisitionCost = this.purchasePrice;
  if (!this.purchaseDate && this.acquisitionDate) this.purchaseDate = this.acquisitionDate;
  if (this.purchasePrice === undefined && this.acquisitionCost !== undefined) this.purchasePrice = this.acquisitionCost;

  if (!this.isNew) return;

  const counter = await Counter.findOneAndUpdate(
    { key: 'assetTag' },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  this.assetTag = `AF-${String(counter.value).padStart(4, '0')}`;
});

assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ isBookable: 1 });
assetSchema.index({ name: 'text', description: 'text', assetTag: 'text' });

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
module.exports.ASSET_STATUSES = ASSET_STATUSES;
module.exports.ASSET_CONDITIONS = ASSET_CONDITIONS;
