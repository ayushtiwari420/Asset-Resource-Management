import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import { clsx } from 'clsx';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch, roleFilter],
    queryFn: () => userService.getAll({ page, limit: 20, search: debouncedSearch, role: roleFilter }).then(r => r.data),
    keepPreviousData: true,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => userService.toggleActive(id),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Operation failed'),
  });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <span className={clsx('badge text-xs font-medium rounded-full px-2.5 py-0.5', ROLE_COLORS[val])}>
          {ROLE_LABELS[val] || val}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => <Badge label={val ? 'Active' : 'Inactive'} colorClass={val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} />,
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (val) => formatDateTime(val),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedUser(row); setNewRole(row.role); }}
            className="text-xs text-blue-600 hover:underline"
          >
            Change Role
          </button>
          <button
            onClick={() => toggleMutation.mutate(val)}
            className={`text-xs hover:underline ${row.isActive ? 'text-red-600' : 'text-green-600'}`}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  const users = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'User Management' }]} />

      <div>
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">Manage user accounts and role assignments</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-64"
          />
          <Select
            options={[{ value: '', label: 'All Roles' }, ...Object.keys(ROLE_LABELS).map(r => ({ value: r, label: ROLE_LABELS[r] }))]}
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-44"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={users} isLoading={isLoading} />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>

      
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`Change Role: ${selectedUser?.name}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedUser(null)}>Cancel</Button>
            <Button onClick={() => roleMutation.mutate({ id: selectedUser._id, role: newRole })} isLoading={roleMutation.isPending}>
              Update Role
            </Button>
          </>
        }
      >
        <Select
          label="New Role"
          options={Object.keys(ROLE_LABELS).map(r => ({ value: r, label: ROLE_LABELS[r] }))}
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;
