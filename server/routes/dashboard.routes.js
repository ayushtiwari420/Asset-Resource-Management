const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/activityLog.controller');
const dashCtrl = require('../controllers/dashboard.controller');

router.use(protect);
router.get('/dashboard', dashCtrl.getDashboardStats);
router.get('/dashboard/kpi', dashCtrl.getKpis);
router.get('/activity-logs', authorize('Admin', 'AssetManager'), ctrl.getActivityLogs);

module.exports = router;
