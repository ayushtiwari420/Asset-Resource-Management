import Breadcrumb from '../../components/ui/Breadcrumb';

const ReportsPage = () => (
  <div className="space-y-5">
    <Breadcrumb items={[{ label: 'Reports' }]} />
    <div>
      <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
      <p className="text-sm text-gray-500">Asset utilization, maintenance trends, and operational metrics</p>
    </div>
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <svg className="h-12 w-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-500 text-sm">Reports dashboard — Export by category, department, date range.</p>
      <p className="text-gray-400 text-xs mt-1">Use the Dashboard page for real-time KPIs and charts.</p>
    </div>
  </div>
);

export default ReportsPage;
