'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, Search, User, Phone, CheckCircle2, ShieldCheck, Package, Stethoscope, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { API_BASE_URL } from '@/config/api';

export default function CallCenterDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== 'CALL_CENTER_AGENT' && user.role !== 'ADMIN')) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setMsg('Please enter at least 3 characters to search.');
      return;
    }
    setMsg('');
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/call-center/farmers/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFarmers(data.data || []);
        if (data.data.length === 0) setMsg('No farmers found matching query.');
      } else {
        setMsg(`⚠️ ${data.error?.message || 'Search failed'}`);
      }
    } catch (e) {
      setMsg('⚠️ Network error searching farmers.');
    }
    setSearching(false);
  };

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500">Loading Support Workspace...</div>;

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      {/* Call Center Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-blue-800 to-indigo-950 text-white p-6 md:p-8 shadow-xl border border-blue-700">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md" className="bg-sky-400 text-sky-950">
              <Headphones className="w-3.5 h-3.5 mr-1" /> CALL CENTER AGENT SUPPORT DESK
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Agent Assistance Desk
            </h1>
            <p className="text-sky-100 text-xs md:text-sm font-medium">
              Search farmers by phone number or name to assist with orders and log crop problems.
            </p>
          </div>

          <div className="w-16 h-16 bg-sky-700/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-sky-500/40 shrink-0">
            🎧
          </div>
        </div>
      </div>

      {/* Search Bar Panel */}
      <Card padding="md" className="space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-sky-600" /> Search Farmer Account
        </h2>

        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Farmer Phone Number (e.g. 9888800001) or Full Name..."
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md" isLoading={searching}>
            Search
          </Button>
        </form>

        {msg && (
          <div className="p-3 bg-sky-50 text-sky-900 text-xs font-bold rounded-xl border border-sky-200">
            {msg}
          </div>
        )}
      </Card>

      {/* Results Workspace */}
      {farmers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Farmers List */}
          <Card padding="md" className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Search Results ({farmers.length})
            </h3>
            <div className="space-y-2">
              {farmers.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFarmer(f)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    selectedFarmer?.id === f.id
                      ? 'bg-sky-50 border-sky-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <h4 className="text-sm font-bold text-slate-900">{f.fullName}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">📱 {f.phone} • Lang: {f.preferredLanguage}</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Selected Farmer Context */}
          <Card padding="md" className="md:col-span-2 space-y-6">
            {!selectedFarmer ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                Select a farmer from the search results to inspect context and provide phone assistance.
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedFarmer.fullName}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Mobile: <strong>{selectedFarmer.phone}</strong> • Language: <strong>{selectedFarmer.preferredLanguage}</strong>
                    </p>
                  </div>
                  <Badge variant="success" size="md">{selectedFarmer.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-400 uppercase text-[10px]">Registered Farms</div>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {selectedFarmer.farmerProfile?.farms?.length || 0}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="font-bold text-slate-400 uppercase text-[10px]">Recent Orders</div>
                    <div className="text-xl font-black text-slate-900 mt-1">
                      {selectedFarmer.farmerProfile?.orders?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Assistance Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert(`Assisting farmer ${selectedFarmer.fullName} with order placement.`)}
                      leftIcon={<Package className="w-4 h-4" />}
                    >
                      Assist Order Placement
                    </Button>
                    <Button
                      variant="harvest"
                      size="sm"
                      onClick={() => alert(`Logging crop health problem for farmer ${selectedFarmer.fullName}.`)}
                      leftIcon={<Stethoscope className="w-4 h-4" />}
                    >
                      Log Crop Pest Issue
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
