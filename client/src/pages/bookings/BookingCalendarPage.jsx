import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../../services';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/Badge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const BookingCalendarPage = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const startOfMonth = new Date(year, month, 1).toISOString();
  const endOfMonth = new Date(year, month + 1, 0).toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings-calendar', year, month],
    queryFn: () => bookingService.getCalendar({ start: startOfMonth, end: endOfMonth }).then(r => r.data.data),
  });

  const bookings = data || [];

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Bookings', href: '/bookings' }, { label: 'Calendar' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Booking Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">‹ Prev</button>
          <span className="text-sm font-medium text-gray-700 min-w-40 text-center">{monthName}</span>
          <button onClick={nextMonth} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Next ›</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No bookings this month</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <div key={b._id} className="flex items-start gap-4 px-5 py-4">
                <div className="w-1 self-stretch rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{b.asset?.name}</span>
                    <Badge label={b.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDate(b.startDate)} — {formatDate(b.endDate)} · {b.bookedBy?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendarPage;
