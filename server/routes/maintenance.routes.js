const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/maintenance.controller');

router.use(protect);

router.get('/', ctrl.getMaintenanceRequests);
router.post('/', ctrl.createMaintenanceRequest);
router.get('/:id', ctrl.getMaintenanceById);
router.patch('/:id/approve', authorize('Admin', 'AssetManager'), ctrl.approveMaintenance);
router.patch('/:id/assign', authorize('Admin', 'AssetManager'), ctrl.assignMaintenance);
router.patch('/:id/start', authorize('Admin', 'AssetManager'), ctrl.startMaintenance);
router.patch('/:id/resolve', authorize('Admin', 'AssetManager'), ctrl.completeMaintenance);
router.patch('/:id/complete', authorize('Admin', 'AssetManager'), ctrl.completeMaintenance);
router.patch('/:id/cancel', ctrl.cancelMaintenance);
router.get('/:id/history', ctrl.getMaintenanceHistory);

module.exports = router;
