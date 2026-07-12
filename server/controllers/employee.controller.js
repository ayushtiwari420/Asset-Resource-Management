const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const Employee = require('../models/Employee.model');
const { paginateQuery } = require('../utils/paginateQuery');

const POPULATE = [
  { path: 'user', select: 'name email avatar role isActive' },
  { path: 'department', select: 'name code' },
];

const getEmployees = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.department) filter.department = req.query.department;

  const { data, page, limit, total } = await paginateQuery(Employee, filter, {
    page: req.query.page,
    limit: req.query.limit,
    populate: POPULATE,
  });

  sendPaginated(res, 'Employees fetched', data, page, limit, total);
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate(POPULATE);
  if (!employee) return sendError(res, 'Employee not found', 404);
  sendSuccess(res, 'Employee fetched', employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!employee) return sendError(res, 'Employee not found', 404);
  sendSuccess(res, 'Employee updated', employee);
});

module.exports = { getEmployees, getEmployeeById, updateEmployee };
