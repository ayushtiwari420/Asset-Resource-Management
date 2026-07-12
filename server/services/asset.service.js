const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Employee = require('../models/Employee.model');
const Department = require('../models/Department.model');
const { generateQRCode } = require('./qrcode.service');
const { createNotification } = require('./notification.service');
const { paginateQuery } = require('../utils/paginateQuery');

const buildAssetFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.department) filter.department = query.department;
  if (query.condition) filter.condition = query.condition;

  if (query.warrantyExpiring) {
    const daysAhead = parseInt(query.warrantyExpiring, 10) || 30;
    filter.warrantyExpiry = {
      $gte: new Date(),
      $lte: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    };
  }

  return filter;
};

const createAsset = async (data, createdBy) => {
  const payload = { ...data };
  delete payload.assetTag;

  const asset = await Asset.create({
    ...payload,
    createdBy,
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const qrData = `${clientUrl}/assets/${asset._id}`;
  asset.qrCode = await generateQRCode(qrData);
  await asset.save();

  return asset;
};

const createCustodyConflict = async (assetId) => {
  const allocation = await Allocation.findOne({
    asset: assetId,
    $or: [
      { isActive: true },
      { status: { $in: ['Requested', 'Approved', 'Active', 'active', 'overdue'] } },
    ],
  })
    .populate({ path: 'employee', populate: { path: 'user', select: 'name' } })
    .populate('department', 'name');

  let holderName = 'another holder';
  if (allocation?.allocatedToType === 'Department') {
    holderName = allocation.department?.name || holderName;
  } else if (allocation?.employee) {
    holderName = allocation.employee.user?.name || allocation.employee.employeeId || holderName;
  }

  const err = new Error(`Currently held by ${holderName}`);
  err.statusCode = 409;
  err.code = 'ASSET_CUSTODY_CONFLICT';
  err.assetId = String(assetId);
  throw err;
};

const allocateAsset = async ({
  assetId,
  employeeId,
  departmentId,
  allocatedToType = 'Employee',
  allocatedBy,
  returnDueDate,
  notes,
}) => {
  let employee = null;
  let department = null;

  if (allocatedToType === 'Employee') {
    employee = await Employee.findById(employeeId).populate('user', 'name email');
    if (!employee) {
      const err = new Error('Employee not found'); err.statusCode = 404; throw err;
    }
  } else if (allocatedToType === 'Department') {
    department = await Department.findById(departmentId);
    if (!department) {
      const err = new Error('Department not found'); err.statusCode = 404; throw err;
    }
  } else {
    const err = new Error('allocatedToType must be Employee or Department'); err.statusCode = 400; throw err;
  }

  const asset = await Asset.findOneAndUpdate(
    { _id: assetId, status: 'Available' },
    {
      $set: {
        status: 'Allocated',
        assignedTo: employee?._id || null,
        ...(department && { department: department._id }),
      },
    },
    { new: false }
  );

  if (!asset) {
    const exists = await Asset.exists({ _id: assetId });
    if (!exists) {
      const err = new Error('Asset not found'); err.statusCode = 404; throw err;
    }
    await createCustodyConflict(assetId);
  }

  let allocation;
  try {
    allocation = await Allocation.create({
      asset: assetId,
      allocatedToType,
      employee: employee?._id || null,
      department: department?._id || null,
      allocatedBy,
      returnDueDate: returnDueDate || null,
      notes,
      status: 'Active',
      isActive: true,
    });
  } catch (error) {
    await Asset.findByIdAndUpdate(assetId, {
      status: asset.status,
      assignedTo: asset.assignedTo,
      department: asset.department,
    });
    throw error;
  }

  if (employee?.user) {
    await createNotification({
      recipientId: employee.user._id,
      type: 'allocation_success',
      title: 'Asset Allocated to You',
      message: `Asset "${asset.name}" (${asset.assetTag}) has been allocated to you.`,
      referenceId: allocation._id,
      referenceModel: 'Allocation',
    });
  }

  return allocation;
};

const returnAsset = async ({ allocationId, returnedBy, returnNotes, condition }) => {
  const allocation = await Allocation.findById(allocationId).populate('asset employee');
  if (!allocation) {
    const err = new Error('Allocation not found'); err.statusCode = 404; throw err;
  }

  if (!allocation.isActive || !['Active', 'active', 'overdue'].includes(allocation.status)) {
    const err = new Error('This allocation has already been returned or is inactive.');
    err.statusCode = 409;
    throw err;
  }

  allocation.status = 'Returned';
  allocation.isActive = false;
  allocation.returnedAt = new Date();
  allocation.returnAcceptedBy = returnedBy;
  allocation.returnNotes = returnNotes;
  allocation.checkInNotes = returnNotes;
  await allocation.save();

  const asset = await Asset.findById(allocation.asset);
  asset.status = 'Available';
  asset.assignedTo = null;
  if (condition) asset.condition = condition;
  await asset.save();

  return allocation;
};

module.exports = { buildAssetFilter, createAsset, allocateAsset, returnAsset };
