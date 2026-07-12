import { clsx } from 'clsx';
import { WORKFLOW_STATUS_COLORS, STATUS_COLORS } from '../../constants/assetStates';

const STATUS_DOTS = {
  Available: 'bg-green-500',
  Allocated: 'bg-blue-500',
  Reserved: 'bg-purple-500',
  'Under Maintenance': 'bg-yellow-500',
  Lost: 'bg-red-500',
  Retired: 'bg-gray-400',
  Disposed: 'bg-gray-500',
  pending: 'bg-yellow-400',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-gray-400',
  'in-progress': 'bg-indigo-500',
  active: 'bg-green-500',
  returned: 'bg-gray-400',
  overdue: 'bg-red-500',
};

const Badge = ({ label, colorClass, variant = 'default', showDot = true, className = '' }) => {
  const resolvedColor = colorClass
    || STATUS_COLORS[label]
    || WORKFLOW_STATUS_COLORS[label?.toLowerCase()]
    || 'bg-gray-100 text-gray-700';

  const dotColor = STATUS_DOTS[label] || STATUS_DOTS[label?.toLowerCase()];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        resolvedColor,
        className
      )}
    >
      {showDot && dotColor && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      )}
      {label}
    </span>
  );
};

export default Badge;
