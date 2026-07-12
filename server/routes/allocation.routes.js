const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/allocation.controller');

router.use(protect);

router.get('/overdue', authorize('Admin', 'AssetManager'), ctrl.getOverdueAllocations);
router.get('/', authorize('Admin', 'AssetManager', 'DepartmentHead'), ctrl.getAllocations);
router.post('/create', authorize('Admin', 'AssetManager'), ctrl.createAllocation);
router.post('/', authorize('Admin', 'AssetManager'), ctrl.createAllocation);
router.get('/:id', ctrl.getAllocationById);
router.post('/:id/return', authorize('Admin', 'AssetManager'), ctrl.returnAllocation);

module.exports = router;
