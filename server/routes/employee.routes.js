const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/employee.controller');

router.use(protect);

router.get('/', ctrl.getEmployees);
router.get('/:id', ctrl.getEmployeeById);
router.put('/:id', authorize('Admin', 'AssetManager'), ctrl.updateEmployee);

module.exports = router;
