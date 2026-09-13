const fs = require('fs');
const path = require('path');

function writeWithDir(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

const pageContent = `'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

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
      const res = await fetch('http://localhost:4000/api/v1/marketplace/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = \`http://localhost:4000/api/v1/marketplace/products?sortBy=\${sortBy}\`;
      if (selectedCategory) url += \`&categoryId=\${selectedCategory}\`;
      if (searchTerm) url += \`&search=\${encodeURIComponent(searchTerm)}\`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (err: any) {
      setError('Failed to load marketplace products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCropRecommendations = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/marketplace/products/crop-recommendations', {
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await res.json();
      if (data.success) {
        setCropRecommendations(data.data);
      }
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
      const res = await fetch('http://localhost:4000/api/v1/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`,
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

  const navigateToCompare = () => {
    if (selectedCompareIds.length === 0) return;
    router.push(\`/farmer/marketplace/compare?ids=\${selectedCompareIds.join(',')}\`);
  };

  const getToxicityBadge = (toxicityClass?: string) => {
    switch (toxicityClass?.toUpperCase()) {
      case 'GREEN':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2 py-0.5 rounded font-semibold">🟢 Green Label (Slightly Toxic / Bio)</span>;
      case 'BLUE':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs px-2 py-0.5 rounded font-semibold">🔵 Blue Label (Moderately Toxic)</span>;
      case 'YELLOW':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2 py-0.5 rounded font-semibold">🟡 Yellow Label (Highly Toxic)</span>;
      case 'RED':
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 text-xs px-2 py-0.5 rounded font-semibold">🔴 Red Label (Extremely Toxic)</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">Standard Label</span>;
    }
  };

  const displayedProducts = activeTab === 'crop_recommended' && cropRecommendations
    ? cropRecommendations.recommendedProducts
    : products;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                🌱 Crop Protection Marketplace
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Discover Certified Agricultural Inputs
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Browse genuine CIB-registered pesticides, bio-products, fungicides, and fertilizers from verified local dealers.
              </p>
            </div>
            <Link
              href="/farmer/cart"
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2 whitespace-nowrap"
            >
              🛒 View My Cart
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-600/50 text-xs text-emerald-200 flex items-center gap-2">
            <span>🛡️</span>
            <span>
              <strong>Regulatory Safety Notice:</strong> Chemical applications must comply with official CIB guidelines and pre-harvest waiting periods (PHI).
            </span>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-900 font-bold rounded-xl shadow-sm flex justify-between items-center">
            <span>{actionMessage}</span>
            <Link href="/farmer/cart" className="underline text-sm font-extrabold text-emerald-950">Go to Cart →</Link>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={\`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition \${
                  activeTab === 'all'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }\`}
              >
                📦 All Products ({products.length})
              </button>
              {cropRecommendations && (
                <button
                  onClick={() => setActiveTab('crop_recommended')}
                  className={\`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-bold transition \${
                    activeTab === 'crop_recommended'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-emerald-800 hover:text-emerald-900 font-semibold'
                  }\`}
                >
                  🌾 Recommended for Your Crops ({cropRecommendations.farmerCrops?.join(', ') || 'Active Crops'})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <form onSubmit={handleSearchSubmit} className="flex-1 md:flex-none flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48 md:w-64"
                />
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold px-3 py-2 rounded-lg transition"
                >
                  🔍
                </button>
              </form>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg font-medium text-gray-700 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={\`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition \${
                selectedCategory === ''
                  ? 'bg-emerald-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }\`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={\`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition \${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }\`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCompareIds.length > 0 && (
          <div className="sticky top-20 z-40 bg-amber-50 border-2 border-amber-400 p-3 rounded-xl shadow-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <span>⚖️</span>
              <span>{selectedCompareIds.length} Products selected for side-by-side comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCompareIds([])}
                className="text-xs text-gray-600 hover:text-gray-900 underline font-semibold px-2"
              >
                Clear All
              </button>
              <button
                onClick={navigateToCompare}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow"
              >
                Compare Specs Now →
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="mt-2 text-sm font-semibold">Loading marketplace products...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">🌾</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Products Found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search criteria or clearing selected category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative bg-gray-100 h-48 flex items-center justify-center p-4">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <span className="text-5xl">🧪</span>
                    )}

                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {getToxicityBadge(product.compliance?.toxicityClass)}
                    </div>

                    <div className="absolute top-2 right-2">
                      <label className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow flex items-center gap-1 cursor-pointer">
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

                  <div className="p-4">
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      {product.brand} • {product.category?.name}
                    </div>

                    <Link href={\`/farmer/marketplace/products/\${product.slug}\`}>
                      <h3 className="text-base font-extrabold text-gray-900 hover:text-emerald-700 transition mt-1 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    {product.activeIngredients && (
                      <p className="text-xs font-medium text-gray-600 mt-1 line-clamp-1 bg-gray-50 p-1.5 rounded border border-gray-100">
                        🧪 <strong>Active:</strong> {product.activeIngredients}
                      </p>
                    )}

                    {product.targetCrops && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                        🌾 <strong>Target Crops:</strong> {product.targetCrops}
                      </p>
                    )}

                    {product.compliance?.waitingPeriodDays !== undefined && (
                      <div className="mt-2 text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-1 rounded inline-block">
                        ⏳ PHI Waiting Period: {product.compliance.waitingPeriodDays} Days
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-emerald-900">
                        ₹{product.sellingPrice}
                      </span>
                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {product.packSize} {product.packUnit} pack
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={\`/farmer/marketplace/products/\${product.slug}\`}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-3 py-2 rounded-lg transition"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id, product.variants?.[0]?.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3 py-2 rounded-lg transition shadow"
                    >
                      🛒 Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
`;

writeWithDir(path.join(__dirname, 'apps', 'web', 'src', 'app', 'farmer', 'marketplace', 'page.tsx'), pageContent);
console.log('Created farmer marketplace page.');
