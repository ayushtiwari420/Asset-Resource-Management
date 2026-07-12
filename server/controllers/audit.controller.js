const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const AuditCycle = require('../models/AuditCycle.model');
const AuditItem = require('../models/AuditItem.model');
const Asset = require('../models/Asset.model');

const getAuditCycles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [cycles, total] = await Promise.all([
    AuditCycle.find(filter)
      .populate('createdBy', 'name')
      .populate('departments', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditCycle.countDocuments(filter),
  ]);

  sendSuccess(res, 'Audit cycles fetched', cycles, 200, { page, limit, total });
});

const createAuditCycle = asyncHandler(async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    departments,
    notes,
    scopeType = 'Department',
    scopeValue,
  } = req.body;

  const cycle = await AuditCycle.create({
    name,
    startDate,
    endDate,
    departments,
    notes,
    scopeType,
    scopeValue,
    status: 'Draft',
    createdBy: req.user._id,
  });

  let assetFilter = {};
  if (scopeType === 'Location' && scopeValue) {
    assetFilter = { location: scopeValue };
  } else if (scopeValue) {
    assetFilter = { department: scopeValue };
  } else if (departments?.length) {
    assetFilter = { department: { $in: departments } };
  }
  const assets = await Asset.find(assetFilter, '_id location department');

  if (assets.length > 0) {
    const auditItems = assets.map((asset) => ({
      auditCycle: cycle._id,
      asset: asset._id,
      expectedLocation: asset.location || 'Not specified',
    }));
    await AuditItem.insertMany(auditItems, { ordered: false });
    cycle.totalAssets = assets.length;
    await cycle.save();
  }

  sendCreated(res, `Audit cycle created with ${assets.length} items`, cycle);
});

const getAuditCycleById = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('departments', 'name code');

  if (!cycle) return sendError(res, 'Audit cycle not found', 404);

  const items = await AuditItem.find({ auditCycle: req.params.id })
    .populate('asset', 'assetTag name status location')
    .populate('assignedTo', 'name')
    .populate('verifiedBy', 'name');

  sendSuccess(res, 'Audit cycle fetched', { cycle, items });
});

const startAuditCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) return sendError(res, 'Audit cycle not found', 404);

  if (!['Draft', 'draft'].includes(cycle.status)) {
    return sendError(res, 'Only draft cycles can be started.', 409);
  }

  cycle.status = 'Active';
  await cycle.save();

  sendSuccess(res, 'Audit cycle started', cycle);
});

const verifyAuditItem = asyncHandler(async (req, res) => {
  const { status, actualLocation, condition, notes } = req.body;

  const item = await AuditItem.findOne({
    _id: req.params.itemId,
    auditCycle: req.params.cycleId,
  });

  if (!item) return sendError(res, 'Audit item not found', 404);

  const cycle = await AuditCycle.findById(req.params.cycleId).select('status');
  if (!cycle || !['Active', 'active'].includes(cycle.status)) {
    return sendError(res, 'Audit items can only be verified during an active cycle.', 409);
  }

  const verificationStatus = req.body.verificationStatus || status;
  if (!['Pending', 'Verified', 'Missing', 'Damaged'].includes(verificationStatus)) {
    return sendError(res, 'Invalid verification status.', 400);
  }

  item.status = verificationStatus;
  item.actualLocation = actualLocation || item.expectedLocation;
  item.condition = condition;
  item.notes = notes || '';
  item.verifiedAt = new Date();
  item.verifiedBy = req.user._id;
  await item.save();

  const verified = await AuditItem.countDocuments({
    auditCycle: req.params.cycleId,
    status: { $in: ['Verified', 'Missing', 'Damaged', 'verified', 'missing', 'discrepancy'] },
  });
  const discrepancies = await AuditItem.countDocuments({
    auditCycle: req.params.cycleId,
    status: { $in: ['Missing', 'Damaged', 'missing', 'discrepancy'] },
  });

  await AuditCycle.findByIdAndUpdate(req.params.cycleId, {
    verifiedAssets: verified,
    discrepancies,
  });

  sendSuccess(res, 'Audit item verified', item);
});

const closeAuditCycleById = async (cycleId) => {
  const cycle = await AuditCycle.findById(cycleId);
  if (!cycle) {
    const err = new Error('Audit cycle not found');
    err.statusCode = 404;
    throw err;
  }

  if (!['Active', 'active'].includes(cycle.status)) {
    const err = new Error('Only active cycles can be closed.');
    err.statusCode = 409;
    throw err;
  }

  const missingItems = await AuditItem.find({
    auditCycle: cycleId,
    status: { $in: ['Missing', 'missing'] },
  }).select('asset');
  const assetIds = missingItems.map((item) => item.asset);
  if (assetIds.length) {
    await Asset.updateMany({ _id: { $in: assetIds } }, { status: 'Lost' });
  }

  cycle.status = 'Closed';
  await cycle.save();

  return cycle;
};

const completeAuditCycle = asyncHandler(async (req, res) => {
  const cycle = await closeAuditCycleById(req.params.id);

  sendSuccess(res, 'Audit cycle closed', cycle);
});

const closeAuditCycle = asyncHandler(async (req, res) => {
  const cycleId = req.body.auditCycleId || req.body.id;
  if (!cycleId) return sendError(res, 'auditCycleId is required', 400);
  const cycle = await closeAuditCycleById(cycleId);

  sendSuccess(res, 'Audit cycle closed', cycle);
});

module.exports = {
  getAuditCycles, createAuditCycle, getAuditCycleById,
  startAuditCycle, verifyAuditItem, completeAuditCycle, closeAuditCycle,
};
