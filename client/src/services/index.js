import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  updateAvatar: (id, formData) =>
    api.patch(`/users/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const departmentService = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
};

export const assetCategoryService = {
  getAll: (params) => api.get('/asset-categories', { params }),
  getById: (id) => api.get(`/asset-categories/${id}`),
  create: (data) => api.post('/asset-categories', data),
  update: (id, data) => api.put(`/asset-categories/${id}`, data),
  delete: (id) => api.delete(`/asset-categories/${id}`),
};

export const assetService = {
  getAll: (params) => api.get('/assets', { params }),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  getQR: (id) => api.get(`/assets/${id}/qr`),
  getHistory: (id) => api.get(`/assets/${id}/history`),
  uploadImages: (id, formData) =>
    api.post(`/assets/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const allocationService = {
  getAll: (params) => api.get('/allocations', { params }),
  getById: (id) => api.get(`/allocations/${id}`),
  create: (data) => api.post('/allocations', data),
  return: (id, data) => api.post(`/allocations/${id}/return`, data),
  getOverdue: () => api.get('/allocations/overdue'),
};

export const transferService = {
  getAll: (params) => api.get('/transfers', { params }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  approve: (id, data) => api.patch(`/transfers/${id}/approve`, data),
  reject: (id, data) => api.patch(`/transfers/${id}/reject`, data),
  complete: (id) => api.patch(`/transfers/${id}/complete`),
};

export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  getCalendar: (params) => api.get('/bookings/calendar', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  approve: (id, data) => api.patch(`/bookings/${id}/approve`, data),
  reject: (id, data) => api.patch(`/bookings/${id}/reject`, data),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
};

export const maintenanceService = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  assign: (id, data) => api.patch(`/maintenance/${id}/assign`, data),
  complete: (id, data) => api.patch(`/maintenance/${id}/complete`, data),
  cancel: (id) => api.patch(`/maintenance/${id}/cancel`),
  getHistory: (assetId) => api.get(`/maintenance/${assetId}/history`),
};

export const auditService = {
  getAll: (params) => api.get('/audits', { params }),
  getById: (id) => api.get(`/audits/${id}`),
  create: (data) => api.post('/audits', data),
  start: (id) => api.post(`/audits/${id}/start`),
  verifyItem: (cycleId, itemId, data) => api.patch(`/audits/${cycleId}/items/${itemId}/verify`, data),
  complete: (id) => api.post(`/audits/${id}/complete`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

export const activityLogService = {
  getAll: (params) => api.get('/activity-logs', { params }),
};
