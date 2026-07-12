export const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

export const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

export const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Allocated: 'bg-blue-100 text-blue-700',
  Reserved: 'bg-purple-100 text-purple-700',
  'Under Maintenance': 'bg-yellow-100 text-yellow-700',
  Lost: 'bg-red-100 text-red-700',
  Retired: 'bg-gray-200 text-gray-600',
  Disposed: 'bg-gray-300 text-gray-700',
};

export const MAINTENANCE_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];
export const BOOKING_STATUSES = ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'];
export const TRANSFER_STATUSES = ['pending', 'approved', 'rejected', 'completed'];
export const ALLOCATION_STATUSES = ['active', 'returned', 'overdue'];
export const AUDIT_STATUSES = ['draft', 'active', 'completed'];

export const MAINTENANCE_PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const WORKFLOW_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-200 text-gray-600',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  active: 'bg-green-100 text-green-700',
  returned: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
  missing: 'bg-red-100 text-red-700',
  verified: 'bg-green-100 text-green-700',
  discrepancy: 'bg-orange-100 text-orange-700',
};
