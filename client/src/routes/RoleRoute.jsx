import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../constants/roles';

const RoleRoute = ({ roles = [] }) => {
  const { user } = useAuth();

  if (!user || !hasRole(user, ...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
