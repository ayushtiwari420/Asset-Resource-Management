import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { isAssetManager } from '../../constants/roles';
import toast from 'react-hot-toast';

const AuditCyclesPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audits', page],
    queryFn: () => auditService.getAll({ page, limit: 20 }).then(r => r.data),
  });

  const startMutation = useMutation({
    mutationFn: (id) => auditService.start(id),
    onSuccess: () => { toast.success('Audit cycle started'); qc.invalidateQueries({ queryKey: ['audits'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    { key: 'name', label: 'Cycle Name', render: (val, row) => <Link to={`/audits/${row._id}`} className="text-blue-600 hover:underline font-medium">{val}</Link> },
    { key: 'startDate', label: 'Start', render: (val) => formatDate(val) },
    { key: 'endDate', label: 'End', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    { key: 'totalAssets', label: 'Total Assets' },
    { key: 'verifiedAssets', label: 'Verified' },
    { key: 'discrepancies', label: 'Discrepancies', render: (val) => val > 0 ? <span className="text-red-600 font-medium">{val}</span> : 0 },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
          <Link to={`/audits/${val}`} className="text-xs text-blue-600 hover:underline">View</Link>
          {isAssetManager(user) && row.status === 'draft' && (
            <button onClick={() => startMutation.mutate(val)} className="text-xs text-green-600 hover:underline">Start</button>
          )}
        </div>
      ),
    },
  ];

  const cycles = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Audit Cycles' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Cycles</h1>
          <p className="text-sm text-gray-500">Manage periodic asset verification cycles</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={cycles} isLoading={isLoading} emptyMessage="No audit cycles found" />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>
    </div>
  );
};

export default AuditCyclesPage;
