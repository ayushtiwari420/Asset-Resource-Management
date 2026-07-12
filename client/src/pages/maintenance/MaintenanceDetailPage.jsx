import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { maintenanceService } from '../../services';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { formatDate, formatCurrency } from '../../utils/formatters';

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-40 shrink-0 text-xs font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{value || '—'}</span>
  </div>
);

const MaintenanceDetailPage = () => {
  const { id } = useParams();
  const { data: req, isLoading } = useQuery({
    queryKey: ['maintenance-detail', id],
    queryFn: () => maintenanceService.getById(id).then(r => r.data.data),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400">Loading...</div>;
  if (!req) return <div className="py-12 text-center text-gray-400">Request not found</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <Breadcrumb items={[{ label: 'Maintenance', href: '/maintenance' }, { label: `Request #${req._id.slice(-6)}` }]} />
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">Maintenance Request</h1>
        <Badge label={req.status} />
        <Badge label={req.priority} colorClass={{ low: 'bg-gray-100 text-gray-700', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700' }[req.priority]} />
      </div>
      <Card title="Request Details">
        <DetailRow label="Asset" value={`${req.asset?.assetTag} — ${req.asset?.name}`} />
        <DetailRow label="Type" value={req.type} />
        <DetailRow label="Description" value={req.description} />
        <DetailRow label="Reported By" value={req.reportedBy?.name} />
        <DetailRow label="Assigned To" value={req.assignedTo?.name} />
        <DetailRow label="Scheduled Date" value={formatDate(req.scheduledDate)} />
        <DetailRow label="Started At" value={formatDate(req.startedAt)} />
        <DetailRow label="Completed At" value={formatDate(req.completedAt)} />
        <DetailRow label="Estimated Cost" value={formatCurrency(req.estimatedCost)} />
        <DetailRow label="Actual Cost" value={formatCurrency(req.actualCost)} />
        {req.resolutionNotes && <DetailRow label="Resolution Notes" value={req.resolutionNotes} />}
      </Card>
    </div>
  );
};

export default MaintenanceDetailPage;
