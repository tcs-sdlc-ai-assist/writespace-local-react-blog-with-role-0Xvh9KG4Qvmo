import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar.jsx';
import { getCurrentUser, isAdmin, logout } from '../utils/auth.js';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = (path) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      location.pathname === path
        ? 'text-primary-700 bg-primary-50'
        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
    }`;

  return (
    <nav className="bg-white border-b border-secondary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link
              to="/blogs"
              className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <span role="img" aria-hidden="true" className="text-2xl">
                ✍️
              </span>
              <span className="font-serif">WriteSpace</span>
            </Link>
            <div className="hidden sm:flex items-center space-x-1">
              <Link to="/blogs" className={linkClass('/blogs')}>
                Blogs
              </Link>
              <Link to="/write" className={linkClass('/write')}>
                Write
              </Link>
              {admin && (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/users" className={linkClass('/users')}>
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2">
                <Avatar role={currentUser.role} size="sm" />
                <span className="hidden sm:inline text-sm font-medium text-secondary-700">
                  {currentUser.displayName}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="sm:hidden flex items-center space-x-1 pb-3">
          <Link to="/blogs" className={linkClass('/blogs')}>
            Blogs
          </Link>
          <Link to="/write" className={linkClass('/write')}>
            Write
          </Link>
          {admin && (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/users" className={linkClass('/users')}>
                Users
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;