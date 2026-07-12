const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { promoteUser } = require('../controllers/user.controller');

const router = express.Router();

router.put('/promote-user', protect, authorize('Admin'), promoteUser);

module.exports = router;
