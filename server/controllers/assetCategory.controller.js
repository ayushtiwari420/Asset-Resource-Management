const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const AssetCategory = require('../models/AssetCategory.model');
const { paginateQuery } = require('../utils/paginateQuery');

const getCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive !== 'false';

  const { data, page, limit, total } = await paginateQuery(AssetCategory, filter, {
    page: req.query.page,
    limit: req.query.limit,
  });

  sendPaginated(res, 'Asset categories fetched', data, page, limit, total);
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.create({ ...req.body, createdBy: req.user._id });
  sendCreated(res, 'Asset category created', category);
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);
  if (!category) return sendError(res, 'Asset category not found', 404);
  sendSuccess(res, 'Asset category fetched', category);
});

const updateCategory = asyncHandler(async (req, res) => {
  delete req.body.prefix;
  const category = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!category) return sendError(res, 'Asset category not found', 404);
  sendSuccess(res, 'Asset category updated', category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!category) return sendError(res, 'Asset category not found', 404);
  sendSuccess(res, 'Asset category deactivated');
});

module.exports = { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory };
