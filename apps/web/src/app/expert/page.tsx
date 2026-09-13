'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Microscope, ShieldCheck, FileText, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import { API_BASE_URL } from '@/config/api';

export default function ExpertDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'assigned' | 'open'>('assigned');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadWorkstationData();
    }
  }, [user, isLoading, token, filterTab, router]);

  const loadWorkstationData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/expert/crop-problems`;
      if (filterTab === 'open') url += `?unassignedOnly=true`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setProblems(json.data);
    } catch (e) {
      console.error('Error loading expert workstation data:', e);
    }
    setLoading(false);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
        return <Badge variant="danger" size="sm">🔥 High Severity</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" size="sm">⚠️ Medium Severity</Badge>;
      default:
        return <Badge variant="info" size="sm">ℹ️ Low Severity</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Certified Agronomist Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md">
              <Microscope className="w-3.5 h-3.5 mr-1 text-emerald-400" /> CERTIFIED AGRONOMIST WORKSTATION
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Dr. {user?.fullName}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              Pathology Diagnostics Desk • Verified Expert Status: ACTIVE
            </p>
          </div>

          <Badge variant="success" size="md" className="py-2 px-4 text-xs font-black">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Verified Expert Panel
          </Badge>
        </div>
      </div>

      {/* Case Queue Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <Button
          variant={filterTab === 'assigned' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterTab('assigned')}
        >
          📋 My Assigned Cases ({problems.filter(p => p.expertId).length})
        </Button>
        <Button
          variant={filterTab === 'open' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilterTab('open')}
        >
          📂 Unassigned Open Pool
        </Button>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} variant="card" className="h-64" />)}
        </div>
      ) : problems.length === 0 ? (
        <EmptyState
          icon={<Microscope className="w-8 h-8" />}
          title="No Crop Problems Found"
          description="There are currently no reported disease cases in this diagnostic queue."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p) => (
            <Card
              key={p.id}
              hoverable
              padding="md"
              className="flex flex-col justify-between cursor-pointer space-y-4"
              onClick={() => router.push(`/expert/crop-problems/${p.id}`)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {getSeverityBadge(p.severity)}
                  <Badge variant="neutral" size="sm">{p.status?.replace('_', ' ')}</Badge>
                </div>

                <h3 className="font-black text-slate-900 text-lg line-clamp-1">{p.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Farmer:</strong> {p.farmer?.user?.fullName || 'Farmer'}</span>
                  </div>
                  <div>📍 <strong>Location:</strong> {p.farm?.locationDistrict}, {p.farm?.locationState}</div>
                  <div>🌾 <strong>Crop:</strong> {p.crop?.cropName} ({p.crop?.variety || 'Standard'})</div>
                </div>
              </div>

              <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Case Workstation
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
