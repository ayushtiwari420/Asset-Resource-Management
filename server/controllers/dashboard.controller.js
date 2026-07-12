const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Booking = require('../models/Booking.model');
const MaintenanceRequest = require('../models/MaintenanceRequest.model');
const TransferRequest = require('../models/TransferRequest.model');
const Department = require('../models/Department.model');
const Employee = require('../models/Employee.model');

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [
    assetStatusCounts,
    pendingMaintenance,
    pendingTransfers,
    overdueAllocations,
    upcomingReturns,
    todayBookings,
    departmentAssets,
    recentActivity,
    monthlyMaintenance,
  ] = await Promise.all([
    Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    MaintenanceRequest.countDocuments({ status: { $in: ['Pending', 'pending'] } }),

    TransferRequest.countDocuments({ status: 'pending' }),

    Allocation.countDocuments({
      status: { $in: ['Active', 'active'] },
      returnDueDate: { $lt: new Date() },
    }),

    Allocation.countDocuments({
      status: { $in: ['Active', 'active'] },
      returnDueDate: { $gte: new Date(), $lte: next7Days },
    }),

    Booking.countDocuments({
      status: { $in: ['Upcoming', 'Ongoing', 'approved', 'active'] },
      startTime: { $lte: endOfToday },
      endTime: { $gte: startOfToday },
    }),

    Asset.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
      { $project: { name: '$dept.name', count: 1 } },
    ]),

    require('../models/ActivityLog.model')
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name avatar'),

    MaintenanceRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusMap = {};
  assetStatusCounts.forEach(({ _id, count }) => {
    statusMap[_id] = count;
  });

  sendSuccess(res, 'Dashboard data fetched', {
    kpis: {
      availableAssets: statusMap['Available'] || 0,
      allocatedAssets: statusMap['Allocated'] || 0,
      underMaintenance: statusMap['Under Maintenance'] || 0,
      reservedAssets: statusMap['Reserved'] || 0,
      lostAssets: statusMap['Lost'] || 0,
      retiredAssets: statusMap['Retired'] || 0,
      pendingMaintenance,
      pendingTransfers,
      overdueAllocations,
      upcomingReturns,
      todayBookings,
    },
    charts: {
      departmentAssets,
      maintenanceTrend: monthlyMaintenance,
    },
    recentActivity,
  });
});

const getKpis = asyncHandler(async (req, res) => {
  const now = new Date();
  const [availableAssets, allocatedAssets, activeBookings, overdueReturns] = await Promise.all([
    Asset.countDocuments({ status: 'Available' }),
    Asset.countDocuments({ status: 'Allocated' }),
    Booking.countDocuments({ status: { $in: ['Ongoing', 'active'] } }),
    Allocation.countDocuments({
      status: { $in: ['Active', 'active', 'overdue'] },
      returnDueDate: { $lt: now },
    }),
  ]);

  sendSuccess(res, 'Dashboard KPIs fetched', {
    availableAssets,
    allocatedAssets,
    activeBookings,
    overdueReturns,
  });
});

module.exports = { getDashboardStats, getKpis };
