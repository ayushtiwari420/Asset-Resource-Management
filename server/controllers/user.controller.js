const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError, sendPaginated } = require('../utils/apiResponse');
const User = require('../models/User.model');
const { paginateQuery } = require('../utils/paginateQuery');
const { ROLES, normalizeRole } = require('../models/User.model');
const Employee = require('../models/Employee.model');
const cloudinaryService = require('../services/cloudinary.service');

const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const { data, page, limit, total } = await paginateQuery(User, filter, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [{ path: 'department', select: 'name code' }],
  });

  sendPaginated(res, 'Users fetched', data, page, limit, total);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name code');
  if (!user) return sendError(res, 'User not found', 404);
  sendSuccess(res, 'User fetched', user.toSafeObject());
});

const updateUserRole = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.body.role);

  if (!ROLES.includes(role)) {
    return sendError(res, `Invalid role. Must be one of: ${ROLES.join(', ')}`, 400);
  }

  if (role !== 'Admin') {
    const adminCount = await User.countDocuments({ role: 'Admin', isActive: true });
    const targetUser = await User.findById(req.params.id);
    if (targetUser?.role === 'Admin' && adminCount <= 1) {
      return sendError(res, 'Cannot demote the last Admin.', 409);
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return sendError(res, 'User not found', 404);

  sendSuccess(res, `User role updated to ${role}`, user.toSafeObject());
});

const promoteUser = asyncHandler(async (req, res) => {
  const role = normalizeRole(req.body.role);
  if (!['AssetManager', 'DepartmentHead'].includes(role)) {
    return sendError(res, 'Role must be Asset_Manager or Department_Head.', 400);
  }

  let userId = req.body.userId;
  if (!userId && req.body.employeeId) {
    const employee = await Employee.findById(req.body.employeeId).select('user');
    userId = employee?.user;
  }

  if (!userId) return sendError(res, 'userId or employeeId is required.', 400);

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user) return sendError(res, 'User not found', 404);

  sendSuccess(res, `User promoted to ${role}`, user.toSafeObject());
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 'You cannot deactivate your own account.', 409);
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, {
    isActive: user.isActive,
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return sendError(res, 'No file uploaded', 400);

  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);

  if (user.avatar) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinaryService.deleteFromCloudinary(`assetflow/avatars/${publicId}`);
  }

  const { url } = await cloudinaryService.uploadToCloudinary(
    req.file.buffer,
    `assetflow/avatars`
  );

  user.avatar = url;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 'Avatar updated', { avatar: user.avatar });
});

module.exports = { getUsers, getUserById, updateUserRole, promoteUser, toggleUserActive, updateAvatar };
