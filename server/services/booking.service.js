const Booking = require('../models/Booking.model');
const Asset = require('../models/Asset.model');
const { createNotification } = require('./notification.service');
const mongoose = require('mongoose');

const checkBookingConflict = async (assetId, startTime, endTime, excludeId = null, session = null) => {
  const query = {
    asset: assetId,
    status: { $in: ['Upcoming', 'Ongoing', 'pending', 'approved', 'active'] },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await Booking.findOne(query).session(session).lean();
  return conflict;
};

const createBooking = async ({ assetId, bookedBy, department, startTime, endTime, purpose }) => {
  if (!startTime || !endTime || new Date(startTime) >= new Date(endTime)) {
    const err = new Error('End date must be after start date.');
    err.statusCode = 400;
    throw err;
  }

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      const asset = await Asset.findById(assetId).session(session);
      if (!asset) {
        const err = new Error('Asset not found'); err.statusCode = 404; throw err;
      }

      if (!asset.isBookable) {
        const err = new Error('This asset is not bookable.'); err.statusCode = 409; throw err;
      }

      if (!['Available', 'Reserved'].includes(asset.status)) {
        const err = new Error(`Asset is not available for booking. Current status: ${asset.status}`);
        err.statusCode = 409;
        throw err;
      }

      const conflict = await checkBookingConflict(assetId, startTime, endTime, null, session);
      if (conflict) {
        const err = new Error('Booking conflict: this time slot is already reserved.');
        err.statusCode = 409;
        throw err;
      }

      [booking] = await Booking.create([{
        asset: assetId,
        bookedBy,
        department,
        startTime,
        endTime,
        purpose,
        status: 'Upcoming',
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  return booking;
};

const approveBooking = async (bookingId, approvedBy, approvalNotes) => {
  const booking = await Booking.findById(bookingId).populate('asset bookedBy');
  if (!booking) {
    const err = new Error('Booking not found'); err.statusCode = 404; throw err;
  }

  if (!['pending', 'Upcoming'].includes(booking.status)) {
    const err = new Error(`Cannot approve booking with status: ${booking.status}`);
    err.statusCode = 409;
    throw err;
  }

  booking.status = 'Upcoming';
  booking.approvedBy = approvedBy;
  booking.approvalNotes = approvalNotes || '';
  booking.approvedAt = new Date();
  await booking.save();

  await Asset.findByIdAndUpdate(booking.asset._id, { status: 'Reserved' });

  await createNotification({
    recipientId: booking.bookedBy._id,
    type: 'booking_approved',
    title: 'Booking Approved',
    message: `Your booking for "${booking.asset.name}" has been approved.`,
    referenceId: booking._id,
    referenceModel: 'Booking',
  });

  return booking;
};

const rejectBooking = async (bookingId, rejectedBy, reason) => {
  const booking = await Booking.findById(bookingId).populate('asset bookedBy');
  if (!booking) {
    const err = new Error('Booking not found'); err.statusCode = 404; throw err;
  }

  if (!['pending', 'Upcoming'].includes(booking.status)) {
    const err = new Error(`Cannot reject booking with status: ${booking.status}`);
    err.statusCode = 409;
    throw err;
  }

  booking.status = 'rejected';
  booking.approvedBy = rejectedBy;
  booking.approvalNotes = reason || '';
  await booking.save();

  await createNotification({
    recipientId: booking.bookedBy._id,
    type: 'booking_rejected',
    title: 'Booking Rejected',
    message: `Your booking for "${booking.asset.name}" was rejected${reason ? `: ${reason}` : '.'}`,
    referenceId: booking._id,
    referenceModel: 'Booking',
  });

  return booking;
};

module.exports = { checkBookingConflict, createBooking, approveBooking, rejectBooking };
