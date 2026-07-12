const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const Booking = require('../models/Booking.model');
const bookingService = require('../services/booking.service');
const { paginateQuery } = require('../utils/paginateQuery');

const POPULATE = [
  { path: 'asset', select: 'assetTag name status images' },
  { path: 'bookedBy', select: 'name email avatar' },
  { path: 'department', select: 'name' },
  { path: 'approvedBy', select: 'name' },
];

const getBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.asset) filter.asset = req.query.asset;
  if (req.query.department) filter.department = req.query.department;

  if (req.user.role === 'Employee') {
    filter.bookedBy = req.user._id;
  }

  const { data, page, limit, total } = await paginateQuery(Booking, filter, {
    page: req.query.page,
    limit: req.query.limit,
    sort: { createdAt: -1 },
    populate: POPULATE,
  });

  sendPaginated(res, 'Bookings fetched', data, page, limit, total);
});

const getCalendarBookings = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const filter = {
    status: { $in: ['Upcoming', 'Ongoing', 'approved', 'active', 'pending'] },
  };

  if (start && end) {
    filter.$or = [
      { startTime: { $gte: new Date(start), $lte: new Date(end) } },
      { endTime: { $gte: new Date(start), $lte: new Date(end) } },
    ];
  }

  const bookings = await Booking.find(filter)
    .populate(POPULATE)
    .sort({ startTime: 1 })
    .limit(200);

  sendSuccess(res, 'Calendar bookings fetched', bookings);
});

const createBooking = asyncHandler(async (req, res) => {
  const { assetId, purpose } = req.body;
  const booking = await bookingService.createBooking({
    assetId,
    bookedBy: req.user._id,
    department: req.user.department,
    startTime: req.body.startTime || req.body.startDate,
    endTime: req.body.endTime || req.body.endDate,
    purpose,
  });
  sendCreated(res, 'Booking request submitted', booking);
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(POPULATE);
  if (!booking) return sendError(res, 'Booking not found', 404);
  sendSuccess(res, 'Booking fetched', booking);
});

const approveBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.approveBooking(
    req.params.id,
    req.user._id,
    req.body.approvalNotes
  );
  sendSuccess(res, 'Booking approved', booking);
});

const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rejectBooking(
    req.params.id,
    req.user._id,
    req.body.reason
  );
  sendSuccess(res, 'Booking rejected', booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendError(res, 'Booking not found', 404);

  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdmin = ['Admin', 'AssetManager'].includes(req.user.role);
  if (!isOwner && !isAdmin) return sendError(res, 'Access denied', 403);

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || '';
  booking.cancelledAt = new Date();
  await booking.save();

  sendSuccess(res, 'Booking cancelled', booking);
});

module.exports = {
  getBookings,
  getCalendarBookings,
  createBooking,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
};
