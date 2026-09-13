'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FlaskConical,
  Scale
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function FarmerMarketplacePage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cropRecommendations, setCropRecommendations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'crop_recommended'>('all');
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (token && user?.role === 'FARMER') {
      fetchCropRecommendations();
    }
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err: any) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/marketplace/products?sortBy=${sortBy}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setProducts(data.data.products);
    } catch (err: any) {
      setError('Failed to load marketplace products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCropRecommendations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/products/crop-recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCropRecommendations(data.data);
    } catch (err: any) {
      console.error('Failed to load crop recommendations', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (productId: string, variantId?: string) => {
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, variantId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✅ Product added to your Cart successfully!');
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(data.error?.message || 'Failed to add item to cart');
      }
    } catch (err: any) {
      alert('Error adding item to cart');
    }
  };

  const toggleCompare = (id: string) => {
    if (selectedCompareIds.includes(id)) {
      setSelectedCompareIds(selectedCompareIds.filter((item) => item !== id));
    } else {
      if (selectedCompareIds.length >= 4) {
        alert('You can select up to 4 products for comparison');
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, id]);
    }
  };

  const getToxicityBadge = (toxicityClass?: string) => {
    switch (toxicityClass?.toUpperCase()) {
      case 'GREEN':
        return <Badge variant="success" size="sm">🟢 Green Bio Label</Badge>;
      case 'BLUE':
        return <Badge variant="info" size="sm">🔵 Blue Label</Badge>;
      case 'YELLOW':
        return <Badge variant="warning" size="sm">🟡 Yellow Label</Badge>;
      case 'RED':
        return <Badge variant="danger" size="sm">🔴 Red Label</Badge>;
      default:
        return <Badge variant="neutral" size="sm">CIB Verified</Badge>;
    }
  };

  const displayedProducts = activeTab === 'crop_recommended' && cropRecommendations
    ? cropRecommendations.recommendedProducts
    : products;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Marketplace Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-6 md:p-8 shadow-xl border border-emerald-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md">🌱 CIB CERTIFIED AGRI MARKETPLACE</Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Discover Genuine Agricultural Inputs
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm max-w-2xl font-medium">
              Buy CIB-registered seeds, bio-products, fungicides, and fertilizers directly from licensed local dealers.
            </p>
          </div>
          <Link href="/farmer/cart">
            <Button variant="harvest" size="md" leftIcon={<ShoppingCart className="w-4 h-4" />}>
              View My Cart
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <Card className="p-4 bg-emerald-50 border-emerald-300 text-emerald-900 font-bold flex items-center justify-between">
          <span>{actionMessage}</span>
          <Link href="/farmer/cart" className="text-xs font-black text-emerald-950 underline">Go to Cart →</Link>
        </Card>
      )}

      {/* Filter & Search Bar Panel */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl font-bold text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 All Inputs ({products.length})
            </button>
            {cropRecommendations && (
              <button
                onClick={() => setActiveTab('crop_recommended')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'crop_recommended' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800'
                }`}
              >
                🌾 Crop Recommended ({cropRecommendations.farmerCrops?.join(', ') || 'Active Crops'})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 md:flex-initial justify-end">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 md:flex-initial">
              <Input
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="w-full md:w-64"
              />
              <Button type="submit" variant="primary" size="md">Search</Button>
            </form>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Product Name</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === '' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Product Comparison Bar */}
      {selectedCompareIds.length > 0 && (
        <Card padding="sm" className="bg-amber-50 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
            <Scale className="w-4 h-4 text-amber-700" />
            <span>{selectedCompareIds.length} Products selected for side-by-side comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedCompareIds([])} className="text-xs text-slate-500 hover:text-slate-800 underline">
              Clear All
            </button>
            <Button variant="harvest" size="sm" onClick={() => router.push(`/farmer/marketplace/compare?ids=${selectedCompareIds.join(',')}`)}>
              Compare Specs →
            </Button>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Skeleton key={idx} variant="card" className="h-80" />
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Products Found"
          description="Try adjusting your search criteria or clearing your category filters."
          actionLabel="Clear Filters"
          onAction={() => { setSelectedCategory(''); setSearchTerm(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map((product: any) => (
            <Card key={product.id} hoverable padding="none" className="flex flex-col justify-between overflow-hidden group">
              <div>
                <div className="relative bg-slate-100 h-48 flex items-center justify-center p-4">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                      🧪
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {getToxicityBadge(product.compliance?.toxicityClass)}
                  </div>

                  <div className="absolute top-3 right-3">
                    <label className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCompareIds.includes(product.id)}
                        onChange={() => toggleCompare(product.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Compare
                    </label>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    {product.brand} • {product.category?.name}
                  </div>

                  <Link href={`/farmer/marketplace/products/${product.slug}`}>
                    <h3 className="text-base font-black text-slate-900 hover:text-emerald-700 transition line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  {product.activeIngredients && (
                    <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-1">
                      🧪 <strong>Active:</strong> {product.activeIngredients}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Price</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">₹{product.sellingPrice}</span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/farmer/marketplace/products/${product.slug}`}>
                    <Button variant="ghost" size="sm">Details</Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddToCart(product.id, product.variants?.[0]?.id)}
                    leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
