import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { assetService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatCurrency, formatDateTime } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import { isAssetManager } from '../../constants/roles';

const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-4 py-2.5 border-b border-gray-50 last:border-0">
    <span className="w-40 shrink-0 text-xs font-medium text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{value || '—'}</span>
  </div>
);

const AssetDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);

  const { data: assetRes, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getById(id).then(r => r.data.data),
  });

  const { data: qrRes } = useQuery({
    queryKey: ['asset-qr', id],
    queryFn: () => assetService.getQR(id).then(r => r.data.data),
    enabled: showQR,
  });

  const { data: historyRes } = useQuery({
    queryKey: ['asset-history', id],
    queryFn: () => assetService.getHistory(id).then(r => r.data.data),
  });

  const asset = assetRes;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!asset) return <div className="text-center py-16 text-gray-500">Asset not found.</div>;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Assets', href: '/assets' }, { label: asset.assetTag }]} />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{asset.name}</h1>
            <Badge label={asset.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{asset.assetTag} · {asset.category?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowQR(!showQR)}>
            {showQR ? 'Hide QR' : 'Show QR Code'}
          </Button>
          {isAssetManager(user) && (
            <Link to={`/assets/${id}/edit`}>
              <Button size="sm">Edit Asset</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <div className="lg:col-span-2 space-y-5">
          <Card title="Asset Information">
            <DetailRow label="Asset Tag" value={asset.assetTag} />
            <DetailRow label="Serial Number" value={asset.serialNumber} />
            <DetailRow label="Category" value={asset.category?.name} />
            <DetailRow label="Condition" value={asset.condition} />
            <DetailRow label="Status" value={<Badge label={asset.status} />} />
            <DetailRow label="Location" value={asset.location} />
            <DetailRow label="Department" value={asset.department?.name} />
            <DetailRow label="Assigned To" value={asset.assignedTo?.user?.name} />
            {asset.description && <DetailRow label="Description" value={asset.description} />}
          </Card>

          <Card title="Financial Details">
            <DetailRow label="Purchase Date" value={formatDate(asset.purchaseDate)} />
            <DetailRow label="Purchase Price" value={formatCurrency(asset.purchasePrice)} />
            <DetailRow label="Current Value" value={formatCurrency(asset.currentValue)} />
            <DetailRow label="Vendor" value={asset.vendor} />
            <DetailRow label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
          </Card>

          
          {historyRes && (
            <Card title="Allocation History">
              {historyRes.allocations.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No allocation history</p>
              ) : (
                <div className="space-y-3">
                  {historyRes.allocations.map((a) => (
                    <div key={a._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.employee?.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{formatDate(a.allocatedAt)} → {a.returnedAt ? formatDate(a.returnedAt) : 'Active'}</p>
                      </div>
                      <Badge label={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        
        <div className="space-y-5">
          
          {showQR && qrRes?.qrCode && (
            <Card title="QR Code">
              <div className="flex flex-col items-center gap-3">
                <img src={qrRes.qrCode} alt={`QR for ${asset.assetTag}`} className="w-40 h-40 border border-gray-200 rounded" />
                <p className="text-xs text-gray-500 font-mono">{asset.assetTag}</p>
                <a
                  href={qrRes.qrCode}
                  download={`${asset.assetTag}-qr.png`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Download QR
                </a>
              </div>
            </Card>
          )}

          
          {asset.images?.length > 0 && (
            <Card title="Images">
              <div className="grid grid-cols-2 gap-2">
                {asset.images.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noreferrer">
                    <img src={img.url} alt={`Asset ${i + 1}`} className="w-full h-24 object-cover rounded border border-gray-200" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          
          <Card title="Metadata">
            <DetailRow label="Created At" value={formatDateTime(asset.createdAt)} />
            <DetailRow label="Last Updated" value={formatDateTime(asset.updatedAt)} />
            <DetailRow label="Created By" value={asset.createdBy?.name} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailPage;
