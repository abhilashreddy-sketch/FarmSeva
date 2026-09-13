'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmerFavoritesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'FARMER') {
        router.push('/login');
        return;
      }
      fetchFavorites();
    }
  }, [user, isLoading, router]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (e) {
      setMsg('Failed to load saved favorites');
    }
    setLoading(false);
  };

  const handleRemove = async (favoriteType: 'PRODUCT' | 'SELLER', targetId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ favoriteType, targetId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFavorites();
      }
    } catch (e) {
      setMsg('Failed to remove favorite');
    }
  };

  if (isLoading || loading) {
    return <div className="p-8 text-center font-bold">Loading Saved Favorites...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase">
            MY SAVED ITEMS
          </span>
          <h1 className="text-2xl font-black mt-2">Saved Products & Retailers</h1>
          <p className="text-emerald-100 text-xs mt-1 font-semibold">
            Quickly reorder favorite crop protection products or access trusted local agricultural dealers.
          </p>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
          ⭐
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold">
          {msg}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-md border border-gray-100 text-center space-y-3">
          <div className="text-4xl">🌾</div>
          <h2 className="text-base font-black text-gray-900">No Saved Favorites Yet</h2>
          <p className="text-xs text-gray-500 font-semibold max-w-md mx-auto">
            Explore the Crop-Protection Marketplace to save frequently used pesticides, fertilizers, or trusted retail shops.
          </p>
          <button
            onClick={() => router.push('/farmer/marketplace')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow transition"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white p-5 rounded-3xl shadow-md border border-gray-100 flex items-center justify-between">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {fav.favoriteType}
                </span>
                <div className="text-sm font-black text-gray-900 mt-2 font-mono">{fav.targetId}</div>
                <div className="text-[10px] text-gray-400 font-semibold mt-1">Saved on {new Date(fav.createdAt).toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => handleRemove(fav.favoriteType, fav.targetId)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition"
              >
                🗑️ Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
