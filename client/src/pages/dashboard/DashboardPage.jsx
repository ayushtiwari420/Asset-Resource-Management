import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { timeAgo } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const ICON_STYLES = {
  green: { bg: 'bg-green-100', text: 'text-green-600', ring: 'ring-green-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', ring: 'ring-yellow-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' },
};

const KPICard = ({ label, value, color = 'blue', icon, href }) => {
  const style = ICON_STYLES[color] || ICON_STYLES.blue;

  const content = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 card-hover cursor-${href ? 'pointer' : 'default'} group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0 ring-4 ring-transparent group-hover:${style.ring} transition-all duration-200`}>
          <svg className={`h-5 w-5 ${style.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
          </svg>
        </div>
        {href && (
          <svg className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
};

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#dc2626', '#6b7280'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-medium text-gray-700">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600">{p.name || 'Count'}: <span className="font-semibold text-gray-900">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats().then((r) => r.data.data),
    refetchInterval: 60 * 1000,
  });

  const kpis = data?.kpis || {};

  const kpiCards = [
    { label: 'Available Assets', value: kpis.availableAssets, color: 'green', href: '/assets', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Allocated Assets', value: kpis.allocatedAssets, color: 'blue', href: '/allocations', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { label: 'Under Maintenance', value: kpis.underMaintenance, color: 'yellow', href: '/maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35' },
    { label: 'Reserved', value: kpis.reservedAssets, color: 'purple', href: '/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Overdue Returns', value: kpis.overdueAllocations, color: 'red', href: '/allocations', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Upcoming Returns', value: kpis.upcomingReturns, color: 'indigo', href: '/allocations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: "Today's Bookings", value: kpis.todayBookings, color: 'blue', href: '/bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Pending Maintenance', value: kpis.pendingMaintenance, color: 'orange', href: '/maintenance', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  const deptData = data?.charts?.departmentAssets || [];
  const trendData = data?.charts?.maintenanceTrend || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-6 shimmer rounded w-32 mb-1.5" />
          <div className="h-4 shimmer rounded w-56" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="h-10 w-10 shimmer rounded-xl mb-4" />
              <div className="h-8 shimmer rounded w-16 mb-2" />
              <div className="h-4 shimmer rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your asset &amp; resource operations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live data
          </span>
        </div>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Assets by Department</h3>
            <Link to="/departments" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No department data</div>
          )}
        </div>

        
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Maintenance Trend (6 Months)</h3>
            <Link to="/maintenance" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">No trend data</div>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest actions across the system</p>
          </div>
          <Link to="/reports" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(data?.recentActivity || []).map((log, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-white">
                <span className="text-xs font-bold text-blue-700">
                  {log.user?.name?.[0] || '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 truncate">{log.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.createdAt)} · <span className="text-gray-500">{log.user?.name}</span></p>
              </div>
            </div>
          ))}
          {(!data?.recentActivity?.length) && (
            <div className="px-5 py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg className="h-8 w-8 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No recent activity</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
