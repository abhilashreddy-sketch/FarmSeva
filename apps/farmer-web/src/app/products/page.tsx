'use client';

import React, { useEffect, useState } from 'react';
import {
  SearchInput,
  Select,
  Button,
  Badge,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ShoppingBag, Filter, ArrowRight, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../../lib/api-client';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      setError(null);

      const [catRes, prodRes] = await Promise.all([
        apiFetch<any[]>('/api/v1/marketplace/categories'),
        apiFetch<any[]>('/api/v1/marketplace/products'),
      ]);

      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }

      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      } else if (!prodRes.success) {
        setError(prodRes.error || 'Failed to load products from marketplace API.');
      }
      setIsLoading(false);
    }
    loadCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory || p.category?.id === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header Title */}
      <div className="space-y-1">
        <Badge status="active">District Marketplace</Badge>
        <h1 className="text-2xl font-black text-slate-900">Certified Agricultural Inputs</h1>
        <p className="text-xs text-slate-500">
          Browse verified seeds, bio-pesticides, fertilizers, and farm equipment from licensed dealers.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 sm:space-y-0 sm:flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search input name, brand, or active ingredient..."
          />
        </div>

        {categories.length > 0 && (
          <div className="sm:w-56">
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Products Listing Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {p.category?.name || 'INPUT'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base line-clamp-1">{p.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {p.description || 'Verified agricultural input from licensed district dealer.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Price</span>
                  <p className="text-lg font-black text-slate-900">₹{p.price}</p>
                </div>

                <Link href={`/products/${p.id}`}>
                  <Button variant="primary" size="sm" className="bg-emerald-700 hover:bg-emerald-800">
                    View & Buy
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Products Found"
          description={
            searchQuery || selectedCategory !== 'all'
              ? 'No agricultural inputs matched your search or category filter. Try clearing filters.'
              : 'There are currently no products listed in the district marketplace database.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      )}
    </div>
  );
}
