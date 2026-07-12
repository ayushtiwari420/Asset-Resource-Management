import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { transferService } from '../../services';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { formatDate, formatDateTime } from '../../utils/formatters';

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-40 shrink-0 text-xs font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{value || '—'}</span>
  </div>
);

const TransferDetailPage = () => {
  const { id } = useParams();
  const { data: transfer, isLoading } = useQuery({
    queryKey: ['transfer', id],
    queryFn: () => transferService.getById(id).then(r => r.data.data),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400">Loading...</div>;
  if (!transfer) return <div className="py-12 text-center text-gray-400">Transfer not found</div>;

  return (
    <div className="space-y-5 max-w-2xl">
      <Breadcrumb items={[{ label: 'Transfers', href: '/transfers' }, { label: `Transfer #${transfer._id.slice(-6)}` }]} />
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">Transfer Request</h1>
        <Badge label={transfer.status} />
      </div>
      <Card title="Transfer Details">
        <DetailRow label="Asset" value={`${transfer.asset?.assetTag}`} />
        <DetailRow label="From Department" value={transfer.fromDepartment?.name} />
        <DetailRow label="To Department" value={transfer.toDepartment?.name} />
        <DetailRow label="Requested By" value={transfer.requestedBy?.name} />
        <DetailRow label="Reason" value={transfer.reason} />
        <DetailRow label="Approved By" value={transfer.approvedBy?.name} />
        <DetailRow label="Approval Notes" value={transfer.approvalNotes} />
        <DetailRow label="Created At" value={formatDateTime(transfer.createdAt)} />
        <DetailRow label="Approved At" value={formatDate(transfer.approvedAt)} />
        <DetailRow label="Completed At" value={formatDate(transfer.completedAt)} />
      </Card>
    </div>
  );
};

export default TransferDetailPage;
