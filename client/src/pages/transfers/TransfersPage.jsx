import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transferService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';
import { isAssetManager } from '../../constants/roles';
import toast from 'react-hot-toast';

const TransfersPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approveId, setApproveId] = useState(null);
  const [rejectId, setRejectId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transfers', page, statusFilter],
    queryFn: () => transferService.getAll({ page, limit: 20, status: statusFilter }).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => transferService.approve(id, {}),
    onSuccess: () => { toast.success('Transfer approved'); qc.invalidateQueries({ queryKey: ['transfers'] }); setApproveId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => transferService.reject(id, {}),
    onSuccess: () => { toast.success('Transfer rejected'); qc.invalidateQueries({ queryKey: ['transfers'] }); setRejectId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    { key: 'asset', label: 'Asset', render: (val) => <span className="font-mono text-sm">{val?.assetTag}</span> },
    { key: 'fromDepartment', label: 'From', render: (val) => val?.name || '—' },
    { key: 'toDepartment', label: 'To', render: (val) => val?.name },
    { key: 'requestedBy', label: 'Requested By', render: (val) => val?.name },
    { key: 'reason', label: 'Reason', render: (val) => <span className="max-w-xs truncate block">{val}</span> },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
          <Link to={`/transfers/${val}`} className="text-xs text-blue-600 hover:underline">View</Link>
          {isAssetManager(user) && row.status === 'pending' && (
            <>
              <button onClick={() => setApproveId(val)} className="text-xs text-green-600 hover:underline">Approve</button>
              <button onClick={() => setRejectId(val)} className="text-xs text-red-600 hover:underline">Reject</button>
            </>
          )}
        </div>
      ),
    },
  ];

  const transfers = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Transfer Requests' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Asset Transfers</h1>
        <p className="text-sm text-gray-500">Manage inter-department asset transfer requests</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Select options={[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'completed', label: 'Completed' }]}
          value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-44" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={transfers} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      <ConfirmDialog isOpen={!!approveId} onClose={() => setApproveId(null)} onConfirm={() => approveMutation.mutate(approveId)} isLoading={approveMutation.isPending} title="Approve Transfer" message="This transfer will be approved and the asset department will be updated." confirmLabel="Approve" variant="success" />
      <ConfirmDialog isOpen={!!rejectId} onClose={() => setRejectId(null)} onConfirm={() => rejectMutation.mutate(rejectId)} isLoading={rejectMutation.isPending} title="Reject Transfer" message="This transfer request will be rejected." confirmLabel="Reject" />
    </div>
  );
};

export default TransfersPage;
