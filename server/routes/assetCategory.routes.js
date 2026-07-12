const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/assetCategory.controller');

router.use(protect);

router.get('/', ctrl.getCategories);
router.post('/', authorize('Admin', 'AssetManager'), ctrl.createCategory);
router.get('/:id', ctrl.getCategoryById);
router.put('/:id', authorize('Admin', 'AssetManager'), ctrl.updateCategory);
router.delete('/:id', authorize('Admin'), ctrl.deleteCategory);

module.exports = router;
