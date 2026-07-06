import { Link, useLocation } from 'react-router-dom';

export function PublicNavbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-secondary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span role="img" aria-hidden="true" className="text-2xl">
              ✍️
            </span>
            <span className="font-serif">WriteSpace</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/login'
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/register'
                  ? 'bg-primary-700 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;