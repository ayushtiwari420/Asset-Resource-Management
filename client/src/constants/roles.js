export const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'AssetManager',
  DEPARTMENT_HEAD: 'DepartmentHead',
  EMPLOYEE: 'Employee',
};

export const ROLE_LABELS = {
  Admin: 'Admin',
  AssetManager: 'Asset Manager',
  DepartmentHead: 'Department Head',
  Employee: 'Employee',
};

export const ROLE_COLORS = {
  Admin: 'bg-red-100 text-red-700',
  AssetManager: 'bg-blue-100 text-blue-700',
  DepartmentHead: 'bg-purple-100 text-purple-700',
  Employee: 'bg-gray-100 text-gray-700',
};

export const hasRole = (user, ...roles) => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);
export const isAssetManager = (user) => hasRole(user, ROLES.ADMIN, ROLES.ASSET_MANAGER);
export const isDepartmentHead = (user) => hasRole(user, ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD);
