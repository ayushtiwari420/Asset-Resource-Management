import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService, assetCategoryService, departmentService } from '../../services';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { ASSET_CONDITIONS } from '../../constants/assetStates';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  currentValue: z.coerce.number().min(0).optional(),
  vendor: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const AssetFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: () => assetCategoryService.getAll({ isActive: true, limit: 100 }).then(r => r.data.data),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getAll({ isActive: true, limit: 100 }).then(r => r.data.data),
  });

  const { data: existingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getById(id).then(r => r.data.data),
    enabled: isEdit,
  });

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (existingAsset) {
      reset({
        name: existingAsset.name,
        category: existingAsset.category?._id,
        serialNumber: existingAsset.serialNumber || '',
        purchaseDate: existingAsset.purchaseDate?.split('T')[0] || '',
        purchasePrice: existingAsset.purchasePrice || '',
        currentValue: existingAsset.currentValue || '',
        vendor: existingAsset.vendor || '',
        warrantyExpiry: existingAsset.warrantyExpiry?.split('T')[0] || '',
        location: existingAsset.location || '',
        department: existingAsset.department?._id || '',
        condition: existingAsset.condition || 'Good',
        description: existingAsset.description || '',
        notes: existingAsset.notes || '',
      });
    }
  }, [existingAsset, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? assetService.update(id, data) : assetService.create(data),
    onSuccess: (res) => {
      toast.success(isEdit ? 'Asset updated' : 'Asset registered');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate(`/assets/${isEdit ? id : res.data.data._id}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save asset'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  const categoryOptions = (categories || []).map(c => ({ value: c._id, label: c.name }));
  const deptOptions = [{ value: '', label: 'None' }, ...(departments || []).map(d => ({ value: d._id, label: d.name }))];

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumb items={[
        { label: 'Assets', href: '/assets' },
        { label: isEdit ? 'Edit Asset' : 'Register Asset' },
      ]} />

      <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Asset' : 'Register New Asset'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Asset Name" required error={errors.name?.message} {...register('name')} />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select label="Category" required options={categoryOptions} error={errors.category?.message} {...field} />
              )}
            />
            <Input label="Serial Number" {...register('serialNumber')} />
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Select label="Condition" options={ASSET_CONDITIONS.map(c => ({ value: c, label: c }))} {...field} />
              )}
            />
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <Select label="Department" options={deptOptions} {...field} />
              )}
            />
            <Input label="Location" {...register('location')} />
            <div className="sm:col-span-2">
              <Input label="Description" {...register('description')} />
            </div>
          </div>
        </Card>

        <Card title="Financial & Procurement">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
            <Input label="Purchase Price" type="number" min="0" {...register('purchasePrice')} />
            <Input label="Current Value" type="number" min="0" {...register('currentValue')} />
            <Input label="Vendor" {...register('vendor')} />
            <Input label="Warranty Expiry" type="date" {...register('warrantyExpiry')} />
          </div>
        </Card>

        <Card title="Notes">
          <textarea
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Internal notes..."
            {...register('notes')}
          />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Register Asset'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssetFormPage;
