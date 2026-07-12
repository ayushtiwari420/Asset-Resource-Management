import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService, assetCategoryService, departmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '../../constants/assetStates';
import { isAssetManager } from '../../constants/roles';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';

const AssetsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteId, setDeleteId] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', page, debouncedSearch, statusFilter, categoryFilter, sortBy, sortOrder],
    queryFn: () => assetService.getAll({ page, limit: 20, search: debouncedSearch, status: statusFilter, category: categoryFilter, sortBy, sortOrder }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: () => assetCategoryService.getAll({ isActive: true, limit: 100 }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => assetService.delete(id),
    onSuccess: () => {
      toast.success('Asset retired');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to retire asset'),
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categoriesRes?.data || []).map(c => ({ value: c._id, label: c.name })),
  ];

  const columns = [
    {
      key: 'assetTag',
      label: 'Asset Tag',
      sortable: true,
      render: (val, row) => (
        <Link to={`/assets/${row._id}`} className="text-blue-600 hover:underline font-medium">
          {val}
        </Link>
      ),
    },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'category',
      label: 'Category',
      render: (val) => val?.name || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge label={val} />,
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (val) => <span className="text-xs text-gray-600">{val || '—'}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (val) => val?.name || '—',
    },
    {
      key: 'purchasePrice',
      label: 'Value',
      render: (val) => formatCurrency(val),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/assets/${val}`}
            className="text-xs text-blue-600 hover:underline"
          >
            View
          </Link>
          {isAssetManager(user) && (
            <>
              <Link to={`/assets/${val}/edit`} className="text-xs text-gray-600 hover:underline">
                Edit
              </Link>
              <button
                onClick={() => setDeleteId(val)}
                className="text-xs text-red-600 hover:underline"
              >
                Retire
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const assets = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Assets' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500">Manage and track all organization assets</p>
        </div>
        {isAssetManager(user) && (
          <Button onClick={() => navigate('/assets/new')}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Asset
          </Button>
        )}
      </div>

      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name, tag, serial..."
            className="w-64"
          />
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...ASSET_STATUSES.map(s => ({ value: s, label: s }))]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            placeholder="Filter by status"
            className="w-44"
          />
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            placeholder="Filter by category"
            className="w-44"
          />
          {(search || statusFilter || categoryFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPage(1); }}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={columns}
          data={assets}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isLoading={isLoading}
          emptyMessage="No assets found. Register your first asset."
        />
        <Pagination
          page={meta.page || 1}
          totalPages={meta.totalPages || 1}
          total={meta.total || 0}
          limit={meta.limit || 20}
          onChange={setPage}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
        title="Retire Asset"
        message="This asset will be marked as Retired. This action cannot be undone."
        confirmLabel="Retire Asset"
      />
    </div>
  );
};

export default AssetsPage;
