import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService, assetService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { isAssetManager } from '../../constants/roles';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const bookingSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  purpose: z.string().min(3, 'Purpose is required'),
});

const BookingsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [rejectId, setRejectId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, statusFilter],
    queryFn: () => bookingService.getAll({ page, limit: 20, status: statusFilter }).then(r => r.data),
  });

  const { data: assetsRes } = useQuery({
    queryKey: ['assets-bookable'],
    queryFn: () => assetService.getAll({ status: 'Available', limit: 200 }).then(r => r.data.data),
    enabled: bookingOpen,
  });

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(bookingSchema) });

  const createMutation = useMutation({
    mutationFn: (data) => bookingService.create(data),
    onSuccess: () => { toast.success('Booking submitted'); qc.invalidateQueries({ queryKey: ['bookings'] }); setBookingOpen(false); reset(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Booking failed'),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => bookingService.approve(id, {}),
    onSuccess: () => { toast.success('Booking approved'); qc.invalidateQueries({ queryKey: ['bookings'] }); setApproveId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => bookingService.reject(id, { reason: 'Rejected by manager' }),
    onSuccess: () => { toast.success('Booking rejected'); qc.invalidateQueries({ queryKey: ['bookings'] }); setRejectId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const columns = [
    { key: 'asset', label: 'Asset', render: (val) => val?.name },
    { key: 'bookedBy', label: 'Requested By', render: (val) => val?.name },
    { key: 'startDate', label: 'From', render: (val) => formatDate(val) },
    { key: 'endDate', label: 'To', render: (val) => formatDate(val) },
    { key: 'purpose', label: 'Purpose' },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} /> },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => (
        <div className="flex gap-2">
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

  const bookings = data?.data || [];
  const meta = data?.meta || {};
  const assetOptions = (assetsRes || []).map(a => ({ value: a._id, label: `${a.assetTag} — ${a.name}` }));

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Bookings' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resource Bookings</h1>
          <p className="text-sm text-gray-500">Book shared assets for a specific period</p>
        </div>
        <div className="flex gap-2">
          <Link to="/bookings/calendar">
            <Button variant="secondary">📅 Calendar View</Button>
          </Link>
          <Button onClick={() => { reset(); setBookingOpen(true); }}>+ New Booking</Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Select
          options={[{ value: '', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'completed', label: 'Completed' }]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={bookings} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      <Modal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Request Booking"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit((d) => createMutation.mutate(d))} isLoading={createMutation.isPending}>Submit Booking</Button>
          </>
        }>
        <div className="space-y-4">
          <Controller name="assetId" control={control} render={({ field }) => (
            <Select label="Asset" required options={assetOptions} error={errors.assetId?.message} {...field} />
          )} />
          <Input label="Start Date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
          <Input label="End Date" type="date" required error={errors.endDate?.message} {...register('endDate')} />
          <Input label="Purpose" required error={errors.purpose?.message} {...register('purpose')} />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!approveId} onClose={() => setApproveId(null)} onConfirm={() => approveMutation.mutate(approveId)} isLoading={approveMutation.isPending} title="Approve Booking" message="Confirm approval of this booking request?" confirmLabel="Approve" variant="success" />
      <ConfirmDialog isOpen={!!rejectId} onClose={() => setRejectId(null)} onConfirm={() => rejectMutation.mutate(rejectId)} isLoading={rejectMutation.isPending} title="Reject Booking" message="Are you sure you want to reject this booking?" confirmLabel="Reject" />
    </div>
  );
};

export default BookingsPage;
