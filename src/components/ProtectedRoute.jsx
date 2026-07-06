import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, isAdmin } from '../utils/auth.js';

export function ProtectedRoute({ requireAdmin = false, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/blogs" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  requireAdmin: PropTypes.bool,
  children: PropTypes.node,
};

export default ProtectedRoute;