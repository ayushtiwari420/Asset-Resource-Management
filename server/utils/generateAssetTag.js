const AssetCategory = require('../models/AssetCategory.model');
const Asset = require('../models/Asset.model');

const generateAssetTag = async (categoryId) => {
  const category = await AssetCategory.findById(categoryId);
  if (!category) throw new Error('Asset category not found');

  const prefix = category.prefix.toUpperCase();
  const year = new Date().getFullYear();
  const basePattern = `${prefix}-${year}-`;

  const lastAsset = await Asset.findOne(
    { assetTag: { $regex: `^${basePattern}` } },
    { assetTag: 1 },
    { sort: { assetTag: -1 } }
  );

  let sequence = 1;
  if (lastAsset) {
    const parts = lastAsset.assetTag.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    sequence = lastSeq + 1;
  }

  return `${basePattern}${String(sequence).padStart(4, '0')}`;
};

module.exports = { generateAssetTag };
