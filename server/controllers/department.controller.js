const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const Department = require('../models/Department.model');
const { paginateQuery } = require('../utils/paginateQuery');

const POPULATE = [{ path: 'head', select: 'name email avatar' }, { path: 'createdBy', select: 'name' }];

const getDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { code: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const { data, page, limit, total } = await paginateQuery(Department, filter, {
    page: req.query.page,
    limit: req.query.limit,
    populate: POPULATE,
  });

  sendPaginated(res, 'Departments fetched', data, page, limit, total);
});

const createDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.create({ ...req.body, createdBy: req.user._id });
  sendCreated(res, 'Department created', dept);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id).populate(POPULATE);
  if (!dept) return sendError(res, 'Department not found', 404);
  sendSuccess(res, 'Department fetched', dept);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!dept) return sendError(res, 'Department not found', 404);
  sendSuccess(res, 'Department updated', dept);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!dept) return sendError(res, 'Department not found', 404);
  sendSuccess(res, 'Department deactivated');
});

module.exports = { getDepartments, createDepartment, getDepartmentById, updateDepartment, deleteDepartment };
