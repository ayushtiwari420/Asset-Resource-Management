const MaintenanceRequest = require('../models/MaintenanceRequest.model');
const MaintenanceHistory = require('../models/MaintenanceHistory.model');
const Asset = require('../models/Asset.model');
const { createNotification } = require('./notification.service');

const createMaintenanceRequest = async (data, reportedBy) => {
  const assetId = data.asset || data.assetId;
  const asset = await Asset.findById(assetId);
  if (!asset) {
    const err = new Error('Asset not found'); err.statusCode = 404; throw err;
  }

  if (asset.status === 'Disposed' || asset.status === 'Retired') {
    const err = new Error(`Cannot request maintenance for a ${asset.status} asset.`);
    err.statusCode = 409;
    throw err;
  }

  const request = await MaintenanceRequest.create({
    ...data,
    asset: assetId,
    reportedBy,
    status: 'Pending',
  });

  return request;
};

const approveMaintenance = async (requestId) => {
  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    const err = new Error('Maintenance request not found'); err.statusCode = 404; throw err;
  }
  if (request.status !== 'Pending') {
    const err = new Error(`Cannot approve a request with status: ${request.status}`);
    err.statusCode = 409;
    throw err;
  }

  await Asset.findByIdAndUpdate(request.asset, { status: 'Under Maintenance' });
  request.status = 'Approved';
  await request.save();
  return request;
};

const assignMaintenance = async (requestId, assignedTo) => {
  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    const err = new Error('Maintenance request not found'); err.statusCode = 404; throw err;
  }

  if (request.status !== 'Approved') {
    const err = new Error(`Cannot assign a request with status: ${request.status}`);
    err.statusCode = 409;
    throw err;
  }

  request.assignedTo = assignedTo;
  request.status = 'Technician_Assigned';
  await request.save();

  await createNotification({
    recipientId: assignedTo,
    type: 'maintenance_approved',
    title: 'Maintenance Task Assigned',
    message: `You have been assigned a maintenance task for asset. Request ID: ${request._id}`,
    referenceId: request._id,
    referenceModel: 'MaintenanceRequest',
  });

  return request;
};

const startMaintenance = async (requestId) => {
  const request = await MaintenanceRequest.findById(requestId);
  if (!request) {
    const err = new Error('Maintenance request not found'); err.statusCode = 404; throw err;
  }
  if (request.status !== 'Technician_Assigned') {
    const err = new Error(`Cannot start a request with status: ${request.status}`);
    err.statusCode = 409;
    throw err;
  }

  request.status = 'In_Progress';
  request.startedAt = new Date();
  await request.save();
  return request;
};

const resolveMaintenance = async (requestId, { workDone, actualCost, condition, resolutionNotes, nextScheduled }) => {
  const request = await MaintenanceRequest.findById(requestId).populate('asset reportedBy');
  if (!request) {
    const err = new Error('Maintenance request not found'); err.statusCode = 404; throw err;
  }

  if (!['Approved', 'Technician_Assigned', 'In_Progress'].includes(request.status)) {
    const err = new Error(`Cannot resolve a request with status: ${request.status}`);
    err.statusCode = 409;
    throw err;
  }

  request.status = 'Resolved';
  request.completedAt = new Date();
  request.actualCost = actualCost || 0;
  request.resolutionNotes = resolutionNotes || '';
  await request.save();

  await MaintenanceHistory.create({
    asset: request.asset._id,
    maintenanceRequest: request._id,
    performedBy: request.assignedTo || 'Unknown',
    performedByUser: request.assignedTo,
    workDone,
    cost: actualCost || 0,
    datePerformed: new Date(),
    nextScheduled: nextScheduled || null,
    condition: condition || null,
    notes: resolutionNotes || '',
  });

  await Asset.findByIdAndUpdate(request.asset._id, {
    status: 'Available',
    ...(condition && { condition }),
  });

  if (request.reportedBy) {
    await createNotification({
      recipientId: request.reportedBy._id,
      type: 'maintenance_completed',
      title: 'Maintenance Completed',
      message: `The maintenance request for "${request.asset.name}" has been completed.`,
      referenceId: request._id,
      referenceModel: 'MaintenanceRequest',
    });
  }

  return request;
};

module.exports = {
  createMaintenanceRequest,
  approveMaintenance,
  assignMaintenance,
  startMaintenance,
  resolveMaintenance,
  completeMaintenance: resolveMaintenance,
};
