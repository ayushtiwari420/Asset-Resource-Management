const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/asset.controller');
const { uploadMultiple } = require('../middlewares/upload.middleware');
const { logActivity } = require('../middlewares/activityLogger.middleware');

router.use(protect);

router.get('/', ctrl.getAssets);
router.post('/register',
  authorize('Admin', 'AssetManager'),
  logActivity('CREATE', 'Asset', () => 'Registered new asset'),
  ctrl.createAsset
);
router.post('/',
  authorize('Admin', 'AssetManager'),
  logActivity('CREATE', 'Asset', (req) => `Registered new asset`),
  ctrl.createAsset
);

router.get('/id/:id', ctrl.getAssetById);
router.get('/:id', ctrl.getAssetById);
router.get('/:id/qr', ctrl.getAssetQR);
router.get('/:id/history', ctrl.getAssetHistory);

router.put('/:id',
  authorize('Admin', 'AssetManager'),
  logActivity('UPDATE', 'Asset', (req) => `Updated asset ${req.params.id}`),
  ctrl.updateAsset
);
router.delete('/:id',
  authorize('Admin'),
  logActivity('DELETE', 'Asset', (req) => `Retired asset ${req.params.id}`),
  ctrl.deleteAsset
);
router.post('/:id/images',
  authorize('Admin', 'AssetManager'),
  uploadMultiple('images', 5),
  ctrl.uploadAssetImages
);

module.exports = router;
