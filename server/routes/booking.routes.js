const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/booking.controller');

router.use(protect);

router.get('/calendar', ctrl.getCalendarBookings);
router.get('/', ctrl.getBookings);
router.post('/create', ctrl.createBooking);
router.post('/', ctrl.createBooking);
router.get('/:id', ctrl.getBookingById);
router.patch('/:id/approve', authorize('Admin', 'AssetManager'), ctrl.approveBooking);
router.patch('/:id/reject', authorize('Admin', 'AssetManager'), ctrl.rejectBooking);
router.patch('/:id/cancel', ctrl.cancelBooking);

module.exports = router;
