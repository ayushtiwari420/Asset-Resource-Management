import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate } from '../../utils/formatters';
import { isAssetManager } from '../../constants/roles';
import { MAINTENANCE_PRIORITIES, PRIORITY_COLORS } from '../../constants/assetStates';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const completeSchema = z.object({
  workDone: z.string().min(5, 'Work description required'),
  actualCost: z.coerce.number().min(0).optional(),
  resolutionNotes: z.string().optional(),
});

const MaintenancePage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [completeId, setCompleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', page, statusFilter],
    queryFn: () => maintenanceService.getAll({ page, limit: 20, status: statusFilter }).then(r => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(completeSchema) });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }) => maintenanceService.complete(id, data),
    onSuccess: () => {
      toast.success('Maintenance completed');
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      setCompleteId(null);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    { key: 'asset', label: 'Asset', render: (val) => <span className="font-mono text-xs">{val?.assetTag}</span> },
    { key: 'asset', label: 'Asset Name', render: (val) => val?.name },
    { key: 'priority', label: 'Priority', render: (val) => <span className={`badge text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[val]}`}>{val}</span> },
    { key: 'type', label: 'Type', render: (val) => <span className="text-xs capitalize">{val}</span> },
    { key: 'reportedBy', label: 'Reported By', render: (val) => val?.name },
    { key: 'scheduledDate', label: 'Scheduled', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
          <Link to={`/maintenance/${val}`} className="text-xs text-blue-600 hover:underline">View</Link>
          {isAssetManager(user) && row.status === 'in-progress' && (
            <button onClick={() => { setCompleteId(val); reset(); }} className="text-xs text-green-600 hover:underline">Complete</button>
          )}
        </div>
      ),
    },
  ];

  const requests = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Maintenance' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-sm text-gray-500">Track asset maintenance lifecycle</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Select options={[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]}
          value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-44" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={requests} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      <Modal isOpen={!!completeId} onClose={() => { setCompleteId(null); reset(); }} title="Complete Maintenance"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCompleteId(null); reset(); }}>Cancel</Button>
            <Button variant="success" onClick={handleSubmit((d) => completeMutation.mutate({ id: completeId, data: d }))} isLoading={completeMutation.isPending}>Mark Complete</Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Work Done" required error={errors.workDone?.message} {...register('workDone')} />
          <Input label="Actual Cost" type="number" min="0" {...register('actualCost')} />
          <Input label="Resolution Notes" {...register('resolutionNotes')} />
        </div>
      </Modal>
    </div>
  );
};

export default MaintenancePage;
