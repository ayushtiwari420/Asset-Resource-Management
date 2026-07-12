const mongoose = require('mongoose');

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: [true, 'Category prefix is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [6, 'Prefix cannot exceed 6 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    depreciationRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
