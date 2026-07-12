const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const TransferRequest = require('../models/TransferRequest.model');
const Asset = require('../models/Asset.model');
const { createNotification } = require('../services/notification.service');
const { paginateQuery } = require('../utils/paginateQuery');
const User = require('../models/User.model');

const POPULATE = [
  { path: 'asset', select: 'assetTag name status department' },
  { path: 'fromDepartment', select: 'name code' },
  { path: 'toDepartment', select: 'name code' },
  { path: 'requestedBy', select: 'name email' },
  { path: 'approvedBy', select: 'name email' },
];

const getTransfers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.asset) filter.asset = req.query.asset;

  const { data, page, limit, total } = await paginateQuery(TransferRequest, filter, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
    populate: POPULATE,
  });

  sendPaginated(res, 'Transfer requests fetched', data, page, limit, total);
});

const createTransfer = asyncHandler(async (req, res) => {
  const { assetId, reason } = req.body;
  const toDepartmentId = req.body.toDepartmentId || req.body.toDepartment;

  const asset = await Asset.findById(assetId);
  if (!asset) return sendError(res, 'Asset not found', 404);
  if (!toDepartmentId) return sendError(res, 'toDepartmentId is required', 400);

  const openRequest = await TransferRequest.exists({
    asset: assetId,
    status: { $in: ['pending', 'approved'] },
  });
  if (openRequest) return sendError(res, 'An open transfer request already exists for this asset.', 409);

  const transfer = await TransferRequest.create({
    asset: assetId,
    fromDepartment: asset.department,
    toDepartment: toDepartmentId,
    requestedBy: req.user._id,
    reason,
  });

  const managers = await User.find({ role: { $in: ['Admin', 'AssetManager'] }, isActive: true }, '_id');
  const notifications = managers.map((m) => ({
    recipientId: m._id,
    type: 'transfer_pending',
    title: 'New Transfer Request',
    message: `Transfer request for asset "${asset.name}" (${asset.assetTag}) submitted.`,
    referenceId: transfer._id,
    referenceModel: 'TransferRequest',
  }));
  const { createBulkNotifications } = require('../services/notification.service');
  await createBulkNotifications(notifications);

  sendCreated(res, 'Transfer request submitted', transfer);
});

const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id).populate(POPULATE);
  if (!transfer) return sendError(res, 'Transfer request not found', 404);
  sendSuccess(res, 'Transfer request fetched', transfer);
});

const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id).populate('asset requestedBy');
  if (!transfer) return sendError(res, 'Transfer request not found', 404);

  if (transfer.status !== 'pending') {
    return sendError(res, `Cannot approve a transfer with status: ${transfer.status}`, 409);
  }

  transfer.status = 'approved';
  transfer.approvedBy = req.user._id;
  transfer.approvedAt = new Date();
  transfer.approvalNotes = req.body.approvalNotes || '';
  await transfer.save();

  await createNotification({
    recipientId: transfer.requestedBy._id,
    type: 'transfer_approved',
    title: 'Transfer Request Approved',
    message: `Your transfer request for "${transfer.asset.name}" has been approved.`,
    referenceId: transfer._id,
    referenceModel: 'TransferRequest',
  });

  sendSuccess(res, 'Transfer approved', transfer);
});

const rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id).populate('asset requestedBy');
  if (!transfer) return sendError(res, 'Transfer request not found', 404);

  if (transfer.status !== 'pending') {
    return sendError(res, `Cannot reject a transfer with status: ${transfer.status}`, 409);
  }

  transfer.status = 'rejected';
  transfer.approvedBy = req.user._id;
  transfer.approvalNotes = req.body.reason || '';
  await transfer.save();

  await createNotification({
    recipientId: transfer.requestedBy._id,
    type: 'transfer_rejected',
    title: 'Transfer Request Rejected',
    message: `Your transfer request for "${transfer.asset.name}" was rejected.`,
    referenceId: transfer._id,
    referenceModel: 'TransferRequest',
  });

  sendSuccess(res, 'Transfer rejected', transfer);
});

const completeTransfer = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) return sendError(res, 'Transfer request not found', 404);

  if (transfer.status !== 'approved') {
    return sendError(res, 'Transfer must be approved before completing.', 409);
  }

  transfer.status = 'completed';
  transfer.completedAt = new Date();
  await transfer.save();

  await Asset.findByIdAndUpdate(transfer.asset, { department: transfer.toDepartment });

  sendSuccess(res, 'Transfer completed. Asset department updated.', transfer);
});

module.exports = {
  getTransfers, createTransfer, getTransferById,
  approveTransfer, rejectTransfer, completeTransfer,
};
