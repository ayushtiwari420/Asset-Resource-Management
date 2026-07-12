const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/user.controller');
const { uploadSingle } = require('../middlewares/upload.middleware');

router.use(protect);

router.get('/', authorize('Admin'), ctrl.getUsers);
router.get('/:id', authorize('Admin'), ctrl.getUserById);
router.patch('/:id/role', authorize('Admin'), ctrl.updateUserRole);
router.patch('/:id/toggle-active', authorize('Admin'), ctrl.toggleUserActive);
router.patch('/:id/avatar', uploadSingle('avatar'), ctrl.updateAvatar);

module.exports = router;
