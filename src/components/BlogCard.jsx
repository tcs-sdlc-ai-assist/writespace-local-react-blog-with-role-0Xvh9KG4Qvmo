import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';
import { getCurrentUser, isAdmin } from '../utils/auth.js';

function truncateContent(content, maxLength = 150) {
  if (!content || content.length <= maxLength) {
    return content || '';
  }
  return content.substring(0, maxLength).trimEnd() + '…';
}

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

export function BlogCard({ post, onEdit }) {
  const currentUser = getCurrentUser();
  const admin = isAdmin();
  const isOwner = currentUser && currentUser.userId === post.authorId;
  const canEdit = admin || isOwner;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link
            to={`/blog/${post.id}`}
            className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2 flex-1"
          >
            {post.title}
          </Link>
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(post);
              }}
              className="text-secondary-400 hover:text-primary-600 transition-colors flex-shrink-0 p-1"
              aria-label={`Edit post: ${post.title}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
        </div>
        <Link to={`/blog/${post.id}`} className="flex-1">
          <p className="text-secondary-500 text-sm leading-relaxed mb-4">
            {truncateContent(post.content)}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-secondary-100">
          <div className="flex items-center space-x-2">
            <Avatar role={admin && post.authorId === currentUser?.userId ? 'admin' : 'user'} size="sm" />
            <span className="text-sm font-medium text-secondary-700">
              {post.authorName}
            </span>
          </div>
          <span className="text-xs text-secondary-400">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func,
};

export default BlogCard;