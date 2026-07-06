import PropTypes from 'prop-types';

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

export function Avatar({ role = 'user', size = 'md' }) {
  const isAdmin = role === 'admin';
  const emoji = isAdmin ? '👑' : '📖';
  const bgClass = isAdmin ? 'bg-violet-200' : 'bg-indigo-200';
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${sizeClass} ${bgClass} rounded-full flex items-center justify-center flex-shrink-0`}
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
    >
      <span role="img" aria-hidden="true">
        {emoji}
      </span>
    </div>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Avatar;