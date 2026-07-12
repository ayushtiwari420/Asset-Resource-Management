import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatDateTime } from '../../utils/formatters';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll({ limit: 50 }).then(r => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => { toast.success('All notifications marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.delete(id),
    onSuccess: () => { toast.success('Notification deleted'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Notifications' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAllMutation.mutate()} isLoading={markAllMutation.isPending}>
            Mark All Read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        {isLoading && (
          <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="py-16 text-center">
            <svg className="h-12 w-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n._id}
            className={clsx('flex items-start gap-4 px-5 py-4', !n.isRead && 'bg-blue-50/50')}
          >
            <div className={clsx('w-2 h-2 rounded-full mt-2 shrink-0', n.isRead ? 'bg-transparent' : 'bg-blue-500')} />
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm font-medium', n.isRead ? 'text-gray-700' : 'text-gray-900')}>{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!n.isRead && (
                <button
                  onClick={() => markOneMutation.mutate(n._id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(n._id)}
                className="text-xs text-red-400 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
