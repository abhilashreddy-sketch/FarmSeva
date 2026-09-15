'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import { Truck, Search, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryUser {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  status: string;
  createdAt: string;
  deliveryProfile?: {
    vehicleType?: string;
    vehicleNumber?: string;
    drivingLicenseNumber?: string;
    status?: string;
  };
}

export default function AdminDeliveryPartnersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partners, setPartners] = useState<DeliveryUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPartners = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<DeliveryUser[]>('/api/v1/admin/users?role=DELIVERY_PARTNER&limit=50');

    if (res.success && Array.isArray(res.data)) {
      setPartners(res.data);
    } else {
      setError(res.error || 'Failed to fetch delivery logistics partners');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const dp = p.deliveryProfile;
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (dp?.vehicleNumber && dp.vehicleNumber.toLowerCase().includes(q)) ||
      (dp?.vehicleType && dp.vehicleType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Delivery Logistics Partners Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Active delivery personnel, vehicle specifications, and logistics operational status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPartners}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Fleet
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <TextInput
          label="Search Fleet Partners"
          placeholder="Search partner name, phone, vehicle type, or registration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Fleet Directory Unavailable" message={error} onRetry={fetchPartners} />
      ) : filteredPartners.length === 0 ? (
        <EmptyState
          title="No Delivery Partners Found"
          description="No delivery partner accounts matched your query."
          icon={<Truck className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Partner Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Vehicle Details</th>
                  <th className="px-4 py-3">Fleet Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPartners.map((partner) => {
                  const dp = partner.deliveryProfile;
                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{partner.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{partner.id}</div>
                      </td>
                      <td className="px-4 py-3">{partner.phone}</td>
                      <td className="px-4 py-3 font-mono">
                        <div>Type: {dp?.vehicleType || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">Reg: {dp?.vehicleNumber || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={partner.status === 'ACTIVE' ? 'success' : 'inactive'}>
                          {partner.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/users/${partner.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                            Profile
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
