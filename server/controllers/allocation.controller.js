const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const Allocation = require('../models/Allocation.model');
const assetService = require('../services/asset.service');
const { paginateQuery } = require('../utils/paginateQuery');

const POPULATE = [
  { path: 'asset', select: 'assetTag name status category', populate: { path: 'category', select: 'name' } },
  { path: 'employee', select: 'employeeId designation', populate: { path: 'user', select: 'name email' } },
  { path: 'allocatedBy', select: 'name email' },
];

const getAllocations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.employee) filter.employee = req.query.employee;
  if (req.query.asset) filter.asset = req.query.asset;

  const { data, page, limit, total } = await paginateQuery(Allocation, filter, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
    populate: POPULATE,
  });

  sendPaginated(res, 'Allocations fetched', data, page, limit, total);
});

const createAllocation = asyncHandler(async (req, res) => {
  const { assetId, employeeId, departmentId, allocatedToType, returnDueDate, notes } = req.body;
  const allocation = await assetService.allocateAsset({
    assetId,
    employeeId,
    departmentId,
    allocatedToType,
    allocatedBy: req.user._id,
    returnDueDate,
    notes,
  });
  sendCreated(res, 'Asset allocated successfully', allocation);
});

const getAllocationById = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id).populate(POPULATE);
  if (!allocation) return sendError(res, 'Allocation not found', 404);
  sendSuccess(res, 'Allocation fetched', allocation);
});

const returnAllocation = asyncHandler(async (req, res) => {
  const { returnNotes, condition } = req.body;
  const allocation = await assetService.returnAsset({
    allocationId: req.params.id,
    returnedBy: req.user._id,
    returnNotes,
    condition,
  });
  sendSuccess(res, 'Asset returned successfully', allocation);
});

const getOverdueAllocations = asyncHandler(async (req, res) => {
  const overdue = await Allocation.find({
    status: { $in: ['Active', 'active'] },
    returnDueDate: { $lt: new Date() },
  })
    .populate(POPULATE)
    .sort({ returnDueDate: 1 });

  const ids = overdue.map((a) => a._id);
  if (ids.length > 0) {
    await Allocation.updateMany({ _id: { $in: ids } }, { status: 'overdue' });
  }

  sendSuccess(res, 'Overdue allocations fetched', overdue);
});

module.exports = { getAllocations, createAllocation, getAllocationById, returnAllocation, getOverdueAllocations };
