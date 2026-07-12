const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/users', require('./user.routes'));
router.use('/departments', require('./department.routes'));
router.use('/employees', require('./employee.routes'));
router.use('/asset-categories', require('./assetCategory.routes'));
router.use('/assets', require('./asset.routes'));
router.use('/allocations', require('./allocation.routes'));
router.use('/transfers', require('./transfer.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/maintenance', require('./maintenance.routes'));
router.use('/audits', require('./audit.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/', require('./dashboard.routes'));

module.exports = router;
