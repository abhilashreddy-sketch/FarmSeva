'use client';

import React, { useEffect, useState } from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
  SearchInput,
  CardSkeleton,
  EmptyState,
} from '@farm-seva/shared-ui';
import { Sprout, ShoppingBag, Stethoscope, ArrowRight, Package, Truck, Compass } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../lib/api-client';

export default function FarmerHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setIsLoading(true);
      const [catRes, prodRes] = await Promise.all([
        apiFetch<any[]>('/api/v1/marketplace/categories'),
        apiFetch<any[]>('/api/v1/marketplace/products?limit=4'),
      ]);

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
      if (prodRes.success && Array.isArray(prodRes.data)) {
        setRecentProducts(prodRes.data);
      }
      setIsLoading(false);
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 sm:py-4">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-emerald-700">
        <div className="flex items-center gap-2">
          <Badge status="active">Customer Application</Badge>
          <span className="text-xs text-emerald-200 font-bold">• Everything your farm needs</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          Welcome to FARM SEVA
        </h1>
        <p className="text-emerald-100 text-sm font-medium max-w-2xl leading-relaxed">
          Buy certified agricultural inputs from licensed district dealers, track active crop sowings, get Gemini AI crop disease diagnostics, and manage orders.
        </p>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-2.5 pt-2">
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full bg-amber-400 text-emerald-950 hover:bg-amber-300 font-black" rightIcon={<ArrowRight className="w-4 h-4" />}>
              BUY INPUTS
            </Button>
          </Link>
          <Link href="/crops" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              MY CROPS
            </Button>
          </Link>
          <Link href="/advisory" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              GET HELP
            </Button>
          </Link>
          <Link href="/orders" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              TRACK ORDERS
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Search Marketplace & Crop Care
        </label>
        <div className="flex gap-2">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seeds, fertilizers, pesticides, or crop problems..."
          />
          <Link href={searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products'}>
            <Button variant="secondary" size="md" className="shrink-0">
              Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Marketplace"
          value="Certified Inputs"
          subtitle="Licensed district dealers"
          icon={<ShoppingBag className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          title="Crop Doctor"
          value="Gemini AI"
          subtitle="Plant photo diagnostics"
          icon={<Sprout className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          title="Agri Experts"
          value="Verified"
          subtitle="Pathologists & Agronomists"
          icon={<Stethoscope className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          title="Deliveries"
          value="Last-Mile"
          subtitle="District driver routing"
          icon={<Truck className="w-4 h-4 text-emerald-700" />}
        />
      </div>

      {/* Categories Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Explore Agricultural Categories</h2>
          <Link href="/products" className="text-xs font-bold text-emerald-700 hover:underline">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat: any) => (
              <Link key={cat.id || cat.slug} href={`/products?category=${cat.id}`}>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition text-center space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    🌾
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Categories Available"
            description="Categories will appear as soon as retail dealers publish their listings."
          />
        )}
      </div>

      {/* Featured Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Featured Inputs</h2>
          <Link href="/products" className="text-xs font-bold text-emerald-700 hover:underline">
            See Marketplace →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentProducts.map((p: any) => (
              <InformationCard
                key={p.id}
                badgeText={p.category?.name || 'INPUT'}
                title={p.name}
                description={p.description || `Price: ₹${p.price} • Available at licensed dealer.`}
                icon={<Package className="w-6 h-6 text-emerald-700" />}
                action={
                  <Link href={`/products/${p.id}`}>
                    <Button variant="outline" size="sm">View Details & Buy</Button>
                  </Link>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Marketplace Catalog Active"
            description="No product items are currently published in your district. Check back soon or register a crop sowing."
            actionLabel="Browse Catalog"
            onAction={() => window.location.href = '/products'}
          />
        )}
      </div>
    </div>
  );
}
