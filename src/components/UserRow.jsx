import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';
import { getCurrentUser } from '../utils/auth.js';

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function UserRow({ user, onDelete }) {
  const currentUser = getCurrentUser();
  const isHardCodedAdmin = user.role === 'admin' && user.username === 'admin';
  const isSelf = currentUser && currentUser.userId === user.id;
  const deleteDisabled = isHardCodedAdmin || isSelf;

  let deleteTooltip = '';
  if (isHardCodedAdmin) {
    deleteTooltip = 'Cannot delete the default admin account';
  } else if (isSelf) {
    deleteTooltip = 'Cannot delete your own account';
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Avatar role={user.role} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-secondary-900 truncate">
              {user.displayName}
            </p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'admin'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {user.role === 'admin' ? 'Admin' : 'User'}
            </span>
          </div>
          <p className="text-xs text-secondary-500 truncate">@{user.username}</p>
          <p className="text-xs text-secondary-400 mt-0.5">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onDelete(user.id)}
          disabled={deleteDisabled}
          title={deleteTooltip}
          className={`p-2 rounded-lg transition-colors ${
            deleteDisabled
              ? 'text-secondary-300 cursor-not-allowed'
              : 'text-secondary-400 hover:text-red-600 hover:bg-red-50'
          }`}
          aria-label={`Delete user: ${user.displayName}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;