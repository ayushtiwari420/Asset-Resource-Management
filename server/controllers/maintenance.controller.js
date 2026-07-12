const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const MaintenanceRequest = require('../models/MaintenanceRequest.model');
const MaintenanceHistory = require('../models/MaintenanceHistory.model');
const maintenanceService = require('../services/maintenance.service');
const { paginateQuery } = require('../utils/paginateQuery');

const POPULATE = [
  { path: 'asset', select: 'assetTag name status' },
  { path: 'reportedBy', select: 'name email' },
  { path: 'assignedTo', select: 'name email' },
];

const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.asset) filter.asset = req.query.asset;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  const { data, page, limit, total } = await paginateQuery(MaintenanceRequest, filter, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
    populate: POPULATE,
  });

  sendPaginated(res, 'Maintenance requests fetched', data, page, limit, total);
});

const createMaintenanceRequest = asyncHandler(async (req, res) => {
  const request = await maintenanceService.createMaintenanceRequest(req.body, req.user._id);
  sendCreated(res, 'Maintenance request created', request);
});

const getMaintenanceById = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id).populate(POPULATE);
  if (!request) return sendError(res, 'Maintenance request not found', 404);
  sendSuccess(res, 'Maintenance request fetched', request);
});

const assignMaintenance = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const request = await maintenanceService.assignMaintenance(req.params.id, assignedTo);
  sendSuccess(res, 'Maintenance request assigned', request);
});

const approveMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.approveMaintenance(req.params.id);
  sendSuccess(res, 'Maintenance request approved', request);
});

const startMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.startMaintenance(req.params.id);
  sendSuccess(res, 'Maintenance work started', request);
});

const completeMaintenance = asyncHandler(async (req, res) => {
  const request = await maintenanceService.completeMaintenance(req.params.id, req.body);
  sendSuccess(res, 'Maintenance completed', request);
});

const cancelMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id).populate('asset');
  if (!request) return sendError(res, 'Maintenance request not found', 404);

  if (request.status === 'Resolved') {
    return sendError(res, 'Cannot cancel a completed maintenance request.', 409);
  }

  request.status = 'cancelled';
  await request.save();

  const Asset = require('../models/Asset.model');
  const asset = await Asset.findById(request.asset);
  if (asset && asset.status === 'Under Maintenance') {
    asset.status = 'Available';
    await asset.save();
  }

  sendSuccess(res, 'Maintenance request cancelled');
});

const getMaintenanceHistory = asyncHandler(async (req, res) => {
  const history = await MaintenanceHistory.find({ asset: req.params.id })
    .populate('performedByUser', 'name')
    .populate('maintenanceRequest', 'description priority type')
    .sort({ datePerformed: -1 });

  sendSuccess(res, 'Maintenance history fetched', history);
});

module.exports = {
  getMaintenanceRequests,
  createMaintenanceRequest,
  getMaintenanceById,
  approveMaintenance,
  assignMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  getMaintenanceHistory,
};
