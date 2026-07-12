const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/transfer.controller');

router.use(protect);

router.get('/', ctrl.getTransfers);
router.post('/request', ctrl.createTransfer);
router.post('/', ctrl.createTransfer);
router.get('/:id', ctrl.getTransferById);
router.patch('/:id/approve', authorize('Admin', 'AssetManager'), ctrl.approveTransfer);
router.patch('/:id/reject', authorize('Admin', 'AssetManager'), ctrl.rejectTransfer);
router.patch('/:id/complete', authorize('Admin', 'AssetManager'), ctrl.completeTransfer);

module.exports = router;
