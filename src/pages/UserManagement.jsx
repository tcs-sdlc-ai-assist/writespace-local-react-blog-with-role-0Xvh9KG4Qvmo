import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, addUser } from '../utils/storage.js';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';

export function UserManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (!admin) {
      navigate('/blogs', { replace: true });
      return;
    }
    setUsers(getUsers());
  }, [admin, navigate]);

  const refreshUsers = () => {
    setUsers(getUsers());
  };

  const handleDeleteClick = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    try {
      deleteUser(userToDelete.id);
      refreshUsers();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setFormError('');

    if (!displayName.trim()) {
      setFormError('Display name is required');
      return;
    }

    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }

    if (username.trim().length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }

    if (!password) {
      setFormError('Password is required');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (!confirmPassword) {
      setFormError('Please confirm the password');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      addUser({
        displayName: displayName.trim(),
        username: username.trim(),
        password,
        role,
      });
      setDisplayName('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setRole('user');
      refreshUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 sm:p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold font-serif mb-2">
            User Management
          </h1>
          <p className="text-primary-100">
            Manage all users on the platform. Create new accounts or remove existing ones.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
              <h2 className="text-xl font-bold font-serif text-secondary-900 mb-4">
                Create User
              </h2>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-secondary-700 mb-1.5"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-secondary-700 mb-1.5"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-secondary-700 mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-secondary-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-secondary-700 mb-1.5"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 text-base font-medium rounded-lg transition-colors shadow-sm ${
                    loading
                      ? 'bg-primary-400 text-white cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {loading ? 'Creating…' : 'Create User'}
                </button>
              </form>
            </div>
          </div>

          {/* Users List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-secondary-900">
                  All Users
                </h2>
                <p className="mt-1 text-secondary-500">
                  {users.length} {users.length === 1 ? 'user' : 'users'} registered
                </p>
              </div>
            </div>

            {users.length > 0 ? (
              <div className="space-y-4">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">
                  <span role="img" aria-hidden="true">
                    👥
                  </span>
                </div>
                <h2 className="text-xl font-bold text-secondary-900 mb-2">
                  No users yet
                </h2>
                <p className="text-secondary-500">
                  Create the first user using the form.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showConfirm && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                <span role="img" aria-hidden="true">
                  ⚠️
                </span>
              </div>
              <h2 className="text-lg font-bold text-secondary-900 mb-1">
                Delete User
              </h2>
              <p className="text-sm text-secondary-500">
                Are you sure you want to delete &ldquo;{userToDelete.displayName}&rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={cancelDelete}
                className="px-5 py-2.5 text-sm font-medium text-secondary-600 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;