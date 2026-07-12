import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { auditService } from '../../services';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { formatDate } from '../../utils/formatters';

const AuditDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getById(id).then(r => r.data.data),
  });

  if (isLoading) return <div className="py-12 text-center text-gray-400">Loading...</div>;
  if (!data) return <div className="py-12 text-center text-gray-400">Audit cycle not found</div>;

  const { cycle, items } = data;

  const columns = [
    { key: 'asset', label: 'Asset Tag', render: (val) => <span className="font-mono text-xs">{val?.assetTag}</span> },
    { key: 'asset', label: 'Asset Name', render: (val) => val?.name },
    { key: 'expectedLocation', label: 'Expected Location' },
    { key: 'actualLocation', label: 'Actual Location' },
    { key: 'condition', label: 'Condition' },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    { key: 'verifiedAt', label: 'Verified At', render: (val) => formatDate(val) },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Audits', href: '/audits' }, { label: cycle.name }]} />
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">{cycle.name}</h1>
        <Badge label={cycle.status} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: cycle.totalAssets },
          { label: 'Verified', value: cycle.verifiedAssets },
          { label: 'Discrepancies', value: cycle.discrepancies },
          { label: 'Period', value: `${formatDate(cycle.startDate)} – ${formatDate(cycle.endDate)}` },
        ].map(kpi => (
          <Card key={kpi.label}>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500">{kpi.label}</p>
          </Card>
        ))}
      </div>
      <Card title="Audit Items" noPadding>
        <Table columns={columns} data={items || []} emptyMessage="No audit items" />
      </Card>
    </div>
  );
};

export default AuditDetailPage;
