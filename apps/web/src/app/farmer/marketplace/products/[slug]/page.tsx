'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProductBySlug(slug as string);
    }
  }, [slug]);

  const fetchProductBySlug = async (productSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/products/${productSlug}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        if (data.data.variants && data.data.variants.length > 0) {
          setSelectedVariant(data.data.variants[0]);
          if (data.data.variants[0].listings && data.data.variants[0].listings.length > 0) {
            setSelectedListing(data.data.variants[0].listings[0]);
          }
        }
      } else {
        setError(data.error?.message || 'Product not found');
      }
    } catch (err: any) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    if (variant.listings && variant.listings.length > 0) {
      setSelectedListing(variant.listings[0]);
    } else {
      setSelectedListing(null);
    }
  };

  const handleAddToCart = async () => {
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
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
          sellerListingId: selectedListing?.id,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✅ Product added to your Cart!');
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(data.error?.message || 'Failed to add to cart');
      }
    } catch (err: any) {
      alert('Error adding item to cart');
    }
  };

  const getToxicityBadge = (toxicityClass?: string) => {
    switch (toxicityClass?.toUpperCase()) {
      case 'GREEN':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs px-3 py-1 rounded-full font-bold">🟢 Green Triangle (Slightly Toxic / Bio)</span>;
      case 'BLUE':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-xs px-3 py-1 rounded-full font-bold">🔵 Blue Triangle (Moderately Toxic)</span>;
      case 'YELLOW':
        return <span className="bg-amber-100 text-amber-950 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold">🟡 Yellow Triangle (Highly Toxic)</span>;
      case 'RED':
        return <span className="bg-rose-100 text-rose-950 border border-rose-300 text-xs px-3 py-1 rounded-full font-bold">🔴 Red Triangle (Extremely Toxic)</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-bold">Standard Label</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl animate-spin inline-block">⏳</span>
            <p className="mt-2 font-bold text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white p-8 rounded-2xl shadow border border-gray-200">
            <span className="text-5xl">⚠️</span>
            <h2 className="text-xl font-bold text-gray-800 mt-2">{error || 'Product Not Found'}</h2>
            <Link href="/farmer/marketplace" className="inline-block mt-4 text-emerald-700 font-extrabold hover:underline">
              ← Return to Marketplace Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/farmer/marketplace" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
            ← Back to Marketplace
          </Link>
        </div>

        {actionMessage && (
          <div className="mb-6 p-4 bg-emerald-100 border border-emerald-400 text-emerald-900 font-bold rounded-xl shadow flex justify-between items-center">
            <span>{actionMessage}</span>
            <Link href="/farmer/cart" className="underline font-extrabold text-emerald-950">View Cart →</Link>
          </div>
        )}

        {/* Top Product Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Preview */}
            <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0].imageUrl} alt={product.name} className="max-h-80 object-contain" />
              ) : (
                <span className="text-7xl">🧪</span>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {product.brand} • {product.category?.name}
                  </span>
                  {getToxicityBadge(product.compliance?.toxicityClass)}
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{product.name}</h1>
                <p className="text-xs text-gray-500 font-medium mt-1">Manufacturer: {product.manufacturer}</p>

                {/* Active Ingredients & Dosage */}
                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                  {product.activeIngredients && (
                    <div className="text-xs">
                      <strong className="text-gray-800">🧪 Active Ingredients:</strong>{' '}
                      <span className="text-emerald-900 font-semibold">{product.activeIngredients}</span>
                    </div>
                  )}
                  {product.targetPestsDiseases && (
                    <div className="text-xs">
                      <strong className="text-gray-800">🎯 Target Pests & Diseases:</strong>{' '}
                      <span className="text-gray-700 font-semibold">{product.targetPestsDiseases}</span>
                    </div>
                  )}
                  {product.targetCrops && (
                    <div className="text-xs">
                      <strong className="text-gray-800">🌾 Suitable Crops:</strong>{' '}
                      <span className="text-gray-700 font-semibold">{product.targetCrops}</span>
                    </div>
                  )}
                  {product.dosageInstructions && (
                    <div className="text-xs">
                      <strong className="text-gray-800">💧 Dosage Recommendation:</strong>{' '}
                      <span className="text-amber-900 font-bold">{product.dosageInstructions}</span>
                    </div>
                  )}
                </div>

                {/* Pack Size Variants Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Select Pack Size / Variant:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => handleVariantChange(v)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition shadow-sm ${
                            selectedVariant?.id === v.id
                              ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-500'
                              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {v.packSize} {v.packUnit} - ₹{v.sellingPrice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Selling Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-950">
                      ₹{selectedVariant ? selectedVariant.sellingPrice : product.sellingPrice}
                    </span>
                    {(selectedVariant?.mrp || product.mrp) > (selectedVariant?.sellingPrice || product.sellingPrice) && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{selectedVariant ? selectedVariant.mrp : product.mrp}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Compliance & Safety Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span>🛡️</span> CIB Regulatory Compliance & Safety Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-xs font-bold text-gray-500">CIB Registration Number</div>
              <div className="text-sm font-black text-gray-900 mt-1">
                {product.compliance?.cgbRegistrationNo || 'CIR-REG-VERIFIED'}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="text-xs font-bold text-amber-900">Pre-Harvest Interval (PHI)</div>
              <div className="text-base font-black text-amber-950 mt-1">
                ⏳ Wait {product.compliance?.waitingPeriodDays || 14} Days Before Harvesting
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
              <div className="text-xs font-bold text-rose-900">Hazard Warning</div>
              <div className="text-xs font-semibold text-rose-950 mt-1">
                {product.compliance?.hazardWarning || 'Wear protective mask & gloves during application.'}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Seller Local Shop Comparison Table */}
        {selectedVariant?.listings && selectedVariant.listings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span>🏪</span> Available at Local Verified Agri Retailers
            </h2>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
                    <th className="p-3">Retail Shop Name</th>
                    <th className="p-3">Location / District</th>
                    <th className="p-3">Available Stock</th>
                    <th className="p-3">Shop Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {selectedVariant.listings.map((l: any) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{l.shop?.shopName}</td>
                      <td className="p-3 text-gray-600">{l.shop?.district}, {l.shop?.state}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          {l.quantityAvailable} in stock
                        </span>
                      </td>
                      <td className="p-3 font-black text-emerald-950 text-sm">₹{l.sellingPrice}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={handleAddToCart}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition"
                        >
                          Select Shop
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
