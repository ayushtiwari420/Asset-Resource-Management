const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/department.controller');

router.use(protect);

router.get('/', ctrl.getDepartments);
router.post('/', authorize('Admin'), ctrl.createDepartment);
router.get('/:id', ctrl.getDepartmentById);
router.put('/:id', authorize('Admin'), ctrl.updateDepartment);
router.delete('/:id', authorize('Admin'), ctrl.deleteDepartment);

module.exports = router;
