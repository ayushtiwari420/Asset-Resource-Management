import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../../services';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

const EmployeesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, debouncedSearch, statusFilter],
    queryFn: () => employeeService.getAll({ page, limit: 20, status: statusFilter }).then(r => r.data),
    keepPreviousData: true,
  });

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'user', label: 'Name', render: (val) => val?.name || '—' },
    { key: 'user', label: 'Email', render: (val) => <span className="text-gray-500">{val?.email}</span> },
    { key: 'department', label: 'Department', render: (val) => val?.name || '—' },
    { key: 'designation', label: 'Designation' },
    { key: 'joiningDate', label: 'Joined', render: (val) => formatDate(val) },
    { key: 'status', label: 'Status', render: (val) => <Badge label={val} colorClass={val === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} /> },
  ];

  const employees = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Employees' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">Employees</h1>
        <p className="text-sm text-gray-500">Employee directory</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search employees..." className="w-64" />
          <Select
            options={[{ value: '', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'terminated', label: 'Terminated' }]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table columns={columns} data={employees} isLoading={isLoading} emptyMessage="No employees found" />
        <Pagination page={meta.page || 1} totalPages={meta.totalPages || 1} total={meta.total || 0} limit={meta.limit || 20} onChange={setPage} />
      </div>
    </div>
  );
};

export default EmployeesPage;
