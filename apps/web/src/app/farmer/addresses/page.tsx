'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function FarmerAddressesPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    villageOrCity: '',
    district: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (token) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      } else {
        setError(data.error?.message || 'Failed to load delivery addresses');
      }
    } catch (err: any) {
      setError('Error connecting to address service');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      villageOrCity: '',
      district: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/v1/addresses/${editingId}`
        : `${API_BASE_URL}/api/v1/addresses`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchAddresses();
      } else {
        alert(data.error?.message || 'Failed to save address');
      }
    } catch (err: any) {
      alert('Error saving address');
    }
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      villageOrCity: addr.villageOrCity,
      district: addr.district,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      } else {
        alert(data.error?.message || 'Failed to delete address');
      }
    } catch (err: any) {
      alert('Error deleting address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      } else {
        alert(data.error?.message || 'Failed to set default address');
      }
    } catch (err: any) {
      alert('Error setting default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🏡</span> Delivery Addresses
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your farm and home delivery locations in your village.
            </p>
          </div>
          {!isAdding && (
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-1.5"
            >
              <span>➕</span> Add New Address
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {isAdding ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? '✏️ Edit Delivery Address' : '➕ Add Rural Delivery Address'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Address Line 1 (House No / Farm Name) *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Door No. 4-12, Near Gram Panchayat"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Address Line 2 (Street / Sector)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder="e.g. Main Bazaar Road"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Near Water Tank"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Village / City *
                </label>
                <input
                  type="text"
                  name="villageOrCity"
                  value={formData.villageOrCity}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Rampur Village"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Guntur"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  placeholder="6-digit postal code"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 mt-4 md:col-span-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-700">
                  Set as default delivery address
                </label>
              </div>

              <div className="md:col-span-2 flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg shadow text-sm"
                >
                  {editingId ? 'Save Changes' : 'Save Delivery Address'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-12">
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="mt-2 text-sm text-gray-600 font-medium">Loading address book...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">📍</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Saved Addresses Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Add your village home or farm address to enable quick delivery dispatch.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow"
            >
              ➕ Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl border p-5 relative shadow-sm flex flex-col justify-between ${
                  addr.isDefault ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                      <span>👤</span> {addr.fullName}
                    </h3>
                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Default Address
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-1 font-semibold">📞 {addr.phone}</p>
                  <p className="text-xs text-gray-700 leading-relaxed mt-2">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                    <br />
                    <span className="font-bold text-gray-800">
                      {addr.villageOrCity}, {addr.district}, {addr.state} - {addr.pincode}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between border-t mt-4 pt-3 gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Make Default
                    </button>
                  )}
                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Delete
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
