const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated, sendError } = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const Employee = require('../models/Employee.model');
const User = require('../models/User.model');
const Counter = require('../models/Counter.model');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });

  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { key: 'employeeId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const employeeId = `EMP-${year}-${String(counter.value).padStart(4, '0')}`;
  await Employee.create({ user: user._id, employeeId });

  sendCreated(res, 'Account created successfully. Please log in.', { id: user._id, email: user.email });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, user } = await authService.login({ email, password }, res);
  sendSuccess(res, 'Login successful', { accessToken, user });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const { accessToken } = await authService.refreshTokens(refreshToken, res);
  sendSuccess(res, 'Token refreshed', { accessToken });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, res);
  sendSuccess(res, 'Logged out successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  await authService.forgotPassword(email, clientUrl);
  sendSuccess(res, 'If that email is registered, a reset link has been sent.');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  await authService.resetPassword(token, password);
  sendSuccess(res, 'Password reset successfully. Please log in with your new password.');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name code');
  sendSuccess(res, 'User profile fetched', user.toSafeObject());
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return sendError(res, 'Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 'Password changed successfully.');
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe, changePassword };
