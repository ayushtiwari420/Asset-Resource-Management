const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Booking = require('../models/Booking.model');
const MaintenanceRequest = require('../models/MaintenanceRequest.model');
const assetService = require('../services/asset.service');
const cloudinaryService = require('../services/cloudinary.service');
const { paginateQuery } = require('../utils/paginateQuery');

const getAssets = asyncHandler(async (req, res) => {
  const filter = assetService.buildAssetFilter(req.query);
  const { data, page, limit, total } = await paginateQuery(Asset, filter, {
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder === 'asc' ? 1 : -1 } : { createdAt: -1 },
    populate: [
      { path: 'category', select: 'name prefix' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', populate: { path: 'user', select: 'name email' } },
    ],
  });

  sendPaginated(res, 'Assets fetched', data, page, limit, total);
});

const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(req.body, req.user._id);
  sendCreated(res, 'Asset registered successfully', asset);
});

const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('category', 'name prefix depreciationRate')
    .populate('department', 'name code')
    .populate('assignedTo', 'employeeId designation user')
    .populate({ path: 'assignedTo', populate: { path: 'user', select: 'name email avatar' } })
    .populate('createdBy', 'name email');

  if (!asset) return sendError(res, 'Asset not found', 404);
  sendSuccess(res, 'Asset fetched', asset);
});

const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return sendError(res, 'Asset not found', 404);

  delete req.body.assetTag;
  delete req.body.qrCode;
  delete req.body.status;

  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 'Asset updated', updated);
});

const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return sendError(res, 'Asset not found', 404);

  if (asset.status === 'Allocated') {
    return sendError(res, 'Cannot delete an allocated asset. Return it first.', 409);
  }

  asset.status = 'Retired';
  await asset.save();

  sendSuccess(res, 'Asset retired successfully');
});

const getAssetQR = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id).select('qrCode assetTag name');
  if (!asset) return sendError(res, 'Asset not found', 404);
  sendSuccess(res, 'QR code fetched', { qrCode: asset.qrCode, assetTag: asset.assetTag });
});

const getAssetHistory = asyncHandler(async (req, res) => {
  const assetId = req.params.id;

  const [allocations, maintenanceRequests, bookings] = await Promise.all([
    Allocation.find({ asset: assetId })
      .populate({ path: 'employee', populate: { path: 'user', select: 'name' } })
      .populate('allocatedBy', 'name')
      .sort({ createdAt: -1 }),
    MaintenanceRequest.find({ asset: assetId })
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 }),
    Booking.find({ asset: assetId })
      .populate('bookedBy', 'name')
      .sort({ createdAt: -1 }),
  ]);

  sendSuccess(res, 'Asset history fetched', { allocations, maintenanceRequests, bookings });
});

const uploadAssetImages = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) return sendError(res, 'Asset not found', 404);

  if (!req.files || req.files.length === 0) {
    return sendError(res, 'No files uploaded', 400);
  }

  const uploadedImages = await Promise.all(
    req.files.map((file) =>
      cloudinaryService.uploadToCloudinary(file.buffer, `assetflow/assets/${asset._id}`)
    )
  );

  asset.images.push(...uploadedImages);
  await asset.save();

  sendSuccess(res, 'Images uploaded successfully', { images: asset.images });
});

module.exports = {
  getAssets,
  createAsset,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetQR,
  getAssetHistory,
  uploadAssetImages,
};
