const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const {
  generateTokenPair,
  generatePasswordResetToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/generateToken');
const { sendEmail, emailTemplates } = require('./email.service');

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  return user;
};

const login = async ({ email, password }, res) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  user.refreshToken = hashToken(refreshToken);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  return { accessToken, user: user.toSafeObject() };
};

const refreshTokens = async (refreshToken, res) => {
  if (!refreshToken) {
    const error = new Error('Refresh token not provided.');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const hashedToken = hashToken(refreshToken);
  const user = await User.findOne({ _id: decoded.id, refreshToken: hashedToken }).select('+refreshToken');

  if (!user || !user.isActive) {
    const error = new Error('Token reuse detected or user not found.');
    error.statusCode = 401;
    throw error;
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  user.refreshToken = hashToken(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, newRefreshToken);
  return { accessToken };
};

const logout = async (userId, res) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  clearRefreshTokenCookie(res);
};

const forgotPassword = async (email, clientUrl) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const { resetToken, hashedToken } = generatePasswordResetToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  const { subject, html } = emailTemplates.passwordReset(user.name, resetUrl);

  await sendEmail({ to: user.email, subject, html });
};

const resetPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Password reset token is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  return user;
};

module.exports = { register, login, refreshTokens, logout, forgotPassword, resetPassword };
