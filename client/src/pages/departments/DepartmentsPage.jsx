import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentService, userService } from '../../services';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { isAdmin } from '../../constants/roles';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required').max(10).toUpperCase(),
  description: z.string().optional(),
  head: z.string().optional(),
});

const DepartmentsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['departments', page, debouncedSearch],
    queryFn: () => departmentService.getAll({ page, limit: 20, search: debouncedSearch }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: usersRes } = useQuery({
    queryKey: ['users-minimal'],
    queryFn: () => userService.getAll({ limit: 200, role: 'DepartmentHead' }).then(r => r.data.data),
  });

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (dept) => {
    setEditing(dept);
    reset({ name: dept.name, code: dept.code, description: dept.description || '', head: dept.head?._id || '' });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? departmentService.update(editing._id, data) : departmentService.create(data),
    onSuccess: () => {
      toast.success(editing ? 'Department updated' : 'Department created');
      qc.invalidateQueries({ queryKey: ['departments'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code' },
    { key: 'head', label: 'Head', render: (val) => val?.name || '—' },
    { key: 'isActive', label: 'Status', render: (val) => <Badge label={val ? 'Active' : 'Inactive'} colorClass={val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} /> },
    {
      key: '_id', label: 'Actions',
      render: (val, row) => isAdmin(user) ? (
        <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:underline">Edit</button>
      ) : null,
    },
  ];

  const depts = data?.data || [];
  const meta = data?.meta || {};
  const headOptions = [{ value: '', label: 'None' }, ...(usersRes || []).map(u => ({ value: u._id, label: u.name }))];

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Departments' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500">Organize your workforce by department</p>
        </div>
        {isAdmin(user) && <Button onClick={openNew}>+ New Department</Button>}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search departments..." className="w-64" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={depts} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'New Department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit((d) => saveMutation.mutate(d))} isLoading={isSubmitting || saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create'}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Code" required error={errors.code?.message} placeholder="e.g. IT, HR, FIN" {...register('code')} />
          <Input label="Description" {...register('description')} />
          <Controller name="head" control={control} render={({ field }) => (
            <Select label="Department Head" options={headOptions} {...field} />
          )} />
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
