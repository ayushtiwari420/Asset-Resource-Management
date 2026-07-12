import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationService, assetService, employeeService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { isAssetManager } from '../../constants/roles';
import toast from 'react-hot-toast';

const allocSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  returnDueDate: z.string().optional(),
  notes: z.string().optional(),
});

const AllocationsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('active');
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [returnId, setReturnId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['allocations', page, statusFilter],
    queryFn: () => allocationService.getAll({ page, limit: 20, status: statusFilter }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: availableAssets } = useQuery({
    queryKey: ['assets-available'],
    queryFn: () => assetService.getAll({ status: 'Available', limit: 200 }).then(r => r.data.data),
    enabled: allocateOpen,
  });

  const { data: allEmployees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeeService.getAll({ status: 'active', limit: 200 }).then(r => r.data.data),
    enabled: allocateOpen,
  });

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(allocSchema) });

  const allocateMutation = useMutation({
    mutationFn: (data) => allocationService.create(data),
    onSuccess: () => {
      toast.success('Asset allocated successfully');
      qc.invalidateQueries({ queryKey: ['allocations'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      setAllocateOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Allocation failed'),
  });

  const returnMutation = useMutation({
    mutationFn: (id) => allocationService.return(id, {}),
    onSuccess: () => {
      toast.success('Asset returned successfully');
      qc.invalidateQueries({ queryKey: ['allocations'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      setReturnId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Return failed'),
  });

  const columns = [
    { key: 'asset', label: 'Asset', render: (val) => <span className="font-medium">{val?.assetTag}</span> },
    { key: 'asset', label: 'Asset Name', render: (val) => val?.name },
    { key: 'employee', label: 'Assigned To', render: (val) => val?.user?.name || '—' },
    { key: 'allocatedAt', label: 'Allocated On', render: (val) => formatDate(val) },
    { key: 'returnDueDate', label: 'Due Date', render: (val) => val ? formatDate(val) : '—' },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => row.status === 'active' || row.status === 'overdue' ? (
        <button onClick={() => setReturnId(val)} className="text-xs text-blue-600 hover:underline">Return</button>
      ) : null,
    },
  ];

  const allocations = data?.data || [];
  const meta = data?.meta || {};

  const assetOptions = (availableAssets || []).map(a => ({ value: a._id, label: `${a.assetTag} — ${a.name}` }));
  const employeeOptions = (allEmployees || []).map(e => ({ value: e._id, label: `${e.employeeId} — ${e.user?.name}` }));

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Allocations' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Asset Allocations</h1>
          <p className="text-sm text-gray-500">Track asset assignments to employees</p>
        </div>
        {isAssetManager(user) && (
          <Button onClick={() => { reset(); setAllocateOpen(true); }}>Allocate Asset</Button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Select
          options={[{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'returned', label: 'Returned' }, { value: 'overdue', label: 'Overdue' }]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-36"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={allocations} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      <Modal isOpen={allocateOpen} onClose={() => setAllocateOpen(false)} title="Allocate Asset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAllocateOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit((d) => allocateMutation.mutate(d))} isLoading={allocateMutation.isPending}>Allocate</Button>
          </>
        }>
        <div className="space-y-4">
          <Controller name="assetId" control={control} render={({ field }) => (
            <Select label="Asset" required options={assetOptions} placeholder="Select available asset" error={errors.assetId?.message} {...field} />
          )} />
          <Controller name="employeeId" control={control} render={({ field }) => (
            <Select label="Employee" required options={employeeOptions} placeholder="Select employee" error={errors.employeeId?.message} {...field} />
          )} />
          <Input label="Return Due Date" type="date" {...register('returnDueDate')} />
          <Input label="Notes" {...register('notes')} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!returnId}
        onClose={() => setReturnId(null)}
        onConfirm={() => returnMutation.mutate(returnId)}
        isLoading={returnMutation.isPending}
        title="Return Asset"
        message="Mark this asset as returned? The asset status will be updated to Available."
        confirmLabel="Confirm Return"
        variant="primary"
      />
    </div>
  );
};

export default AllocationsPage;
