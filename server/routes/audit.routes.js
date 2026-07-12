const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/audit.controller');

router.use(protect);

router.get('/', ctrl.getAuditCycles);
router.post('/create', authorize('Admin', 'AssetManager'), ctrl.createAuditCycle);
router.post('/', authorize('Admin', 'AssetManager'), ctrl.createAuditCycle);
router.put('/close', authorize('Admin', 'AssetManager'), ctrl.closeAuditCycle);
router.get('/:id', ctrl.getAuditCycleById);
router.post('/:id/start', authorize('Admin', 'AssetManager'), ctrl.startAuditCycle);
router.patch('/:cycleId/items/:itemId/verify', ctrl.verifyAuditItem);
router.post('/:id/complete', authorize('Admin', 'AssetManager'), ctrl.completeAuditCycle);

module.exports = router;
