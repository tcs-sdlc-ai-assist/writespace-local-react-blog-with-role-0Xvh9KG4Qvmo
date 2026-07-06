import PropTypes from 'prop-types';

export function StatCard({ title, count, icon, bgColor = 'bg-indigo-100' }) {
  return (
    <div className={`${bgColor} rounded-xl p-6 flex items-center space-x-4`}>
      <div className="text-3xl flex-shrink-0">
        <span role="img" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-secondary-600">{title}</p>
        <p className="text-2xl font-bold text-secondary-900">{count}</p>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
};

export default StatCard;