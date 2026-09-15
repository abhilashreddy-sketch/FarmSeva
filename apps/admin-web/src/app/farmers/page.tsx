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
import { Sprout, Search, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface FarmerUser {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  status: string;
  createdAt: string;
  farmerProfile?: {
    landSizeAcres?: number;
    soilType?: string;
    irrigationSource?: string;
    crops?: string[];
  };
}

export default function AdminFarmersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmers, setFarmers] = useState<FarmerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFarmers = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<FarmerUser[]>('/api/v1/admin/users?role=FARMER&limit=50');

    if (res.success && Array.isArray(res.data)) {
      setFarmers(res.data);
    } else {
      setError(res.error || 'Failed to fetch farmer directory');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.fullName.toLowerCase().includes(q) ||
      f.phone.includes(q) ||
      (f.email && f.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            Registered Farmers Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Overview of registered crop growers, landholding sizes, and regional crop profiles.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchFarmers}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Directory
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <TextInput
          label="Search Farmers"
          placeholder="Search by farmer name, phone number, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Directory Unavailable" message={error} onRetry={fetchFarmers} />
      ) : filteredFarmers.length === 0 ? (
        <EmptyState
          title="No Farmers Found"
          description="No farmer accounts matched your query."
          icon={<Sprout className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Farmer Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Land Size</th>
                  <th className="px-4 py-3">Soil / Irrigation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{farmer.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{farmer.id}</div>
                    </td>
                    <td className="px-4 py-3">{farmer.phone}</td>
                    <td className="px-4 py-3 font-semibold">
                      {farmer.farmerProfile?.landSizeAcres ? `${farmer.farmerProfile.landSizeAcres} Acres` : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div>{farmer.farmerProfile?.soilType || 'Soil: N/A'}</div>
                      <div className="text-[10px] text-slate-400">{farmer.farmerProfile?.irrigationSource || 'Irrigation: N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={farmer.status === 'ACTIVE' ? 'success' : 'rejected'}>{farmer.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/users/${farmer.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                          Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
