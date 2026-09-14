'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Plus, X, Package, Tag, ShieldCheck, Upload, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SellerMarketplacePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    brand: '',
    manufacturer: '',
    description: '',
    activeIngredients: '',
    targetCrops: '',
    targetPestsDiseases: '',
    packSize: '1',
    packUnit: 'L',
    sku: '',
    mrp: '',
    sellingPrice: '',
    stockQuantity: '50',
    imageUrl: '',
    toxicityClass: 'GREEN',
  });

  useEffect(() => {
    if (token && user?.role === 'SELLER') {
      fetchSellerListings();
      fetchCategories();
    }
  }, [token]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/categories`);
      const resData = await res.json();
      if (resData.success) {
        setCategories(resData.data);
        if (resData.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: resData.data[0].id }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchSellerListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/seller/marketplace/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err: any) {
      console.error('Failed to load seller listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
      setMessage({ type: 'error', text: 'Invalid image format. Allowed formats: JPEG, PNG, WEBP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file size exceeds 5MB limit.' });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append('photo', file);

      const res = await fetch(`${API_BASE_URL}/api/v1/seller/marketplace/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const resData = await res.json();
      if (resData.success && resData.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: resData.data.url }));
        setMessage({ type: 'success', text: '📷 Product photo uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: resData.error?.message || 'Failed to upload photo' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error uploading image file' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const mrpNum = parseFloat(formData.mrp);
    const sellingPriceNum = parseFloat(formData.sellingPrice);

    if (sellingPriceNum > mrpNum) {
      setMessage({ type: 'error', text: 'Selling price cannot exceed Maximum Retail Price (MRP).' });
      setSubmitting(false);
      return;
    }

    try {
      const body = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        brand: formData.brand.trim(),
        manufacturer: formData.manufacturer.trim(),
        description: formData.description.trim(),
        activeIngredients: formData.activeIngredients.trim() || undefined,
        targetCrops: formData.targetCrops.trim() || undefined,
        targetPestsDiseases: formData.targetPestsDiseases.trim() || undefined,
        packSize: parseFloat(formData.packSize),
        packUnit: formData.packUnit,
        sku: formData.sku.trim() || undefined,
        mrp: mrpNum,
        sellingPrice: sellingPriceNum,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        imageUrls: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        toxicityClass: formData.toxicityClass,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/seller/marketplace/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const resData = await res.json();
      if (resData.success) {
        setMessage({ type: 'success', text: '⏳ Product submitted for admin approval.' });
        setShowAddModal(false);
        setFormData({
          name: '',
          categoryId: categories[0]?.id || '',
          brand: '',
          manufacturer: '',
          description: '',
          activeIngredients: '',
          targetCrops: '',
          targetPestsDiseases: '',
          packSize: '1',
          packUnit: 'L',
          sku: '',
          mrp: '',
          sellingPrice: '',
          stockQuantity: '50',
          imageUrl: '',
          toxicityClass: 'GREEN',
        });
        fetchSellerListings();
      } else {
        setMessage({ type: 'error', text: resData.error?.message || 'Failed to submit product' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Network error submitting product' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredListings = data?.listings?.filter((l: any) => {
    const status = l.product?.status;
    if (activeFilterTab === 'pending') return status === 'PENDING_APPROVAL';
    if (activeFilterTab === 'approved') return status === 'APPROVED';
    if (activeFilterTab === 'rejected') return status === 'REJECTED';
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>📦</span> Retailer Inventory & Shop Listings Manager
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage product catalog, pricing, and stock inventory for {data?.businessName || 'your agri retail store'}.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product to Catalog</span>
          </button>
        </div>

        {message && (
          <div
            className={`p-4 mb-6 rounded-xl font-semibold text-sm flex items-center justify-between ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-xs underline font-bold">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden space-y-4">
            {/* Filter Tabs */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveFilterTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeFilterTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                >
                  All ({data?.listings?.length || 0})
                </button>
                <button
                  onClick={() => setActiveFilterTab('pending')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${activeFilterTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </button>
                <button
                  onClick={() => setActiveFilterTab('approved')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${activeFilterTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600'}`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approved</span>
                </button>
                <button
                  onClick={() => setActiveFilterTab('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${activeFilterTab === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600'}`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejected</span>
                </button>
              </div>
              <span className="text-xs font-semibold text-emerald-700">Verified Dealer Outlet</span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <Package className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-sm font-bold text-gray-800">No shop listings in this view.</p>
                <p className="text-xs text-gray-500">Click "Add New Product" to submit real agricultural inputs for admin verification.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                >
                  ➕ Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase border-b border-gray-200">
                      <th className="p-3">Product</th>
                      <th className="p-3">Shop</th>
                      <th className="p-3">Pack Variant</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Stock Available</th>
                      <th className="p-3">Selling Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredListings.map((l: any) => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{l.product?.name}</div>
                          <div className="text-[10px] text-gray-500">{l.product?.brand} • {l.product?.manufacturer}</div>
                        </td>
                        <td className="p-3 text-gray-600">{l.shop?.shopName}</td>
                        <td className="p-3 font-semibold">{l.variant?.packSize} {l.variant?.packUnit}</td>
                        <td className="p-3 font-bold">
                          {l.product?.status === 'APPROVED' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" /> APPROVED
                            </span>
                          ) : l.product?.status === 'REJECTED' ? (
                            <div className="space-y-0.5">
                              <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" /> REJECTED
                              </span>
                              {l.product?.rejectionReason && (
                                <div className="text-[10px] text-red-600 italic">Reason: {l.product.rejectionReason}</div>
                              )}
                            </div>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" /> PENDING APPROVAL
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold">
                          <div className="flex items-center gap-2">
                            <span>{l.quantityAvailable} units</span>
                            {l.quantityAvailable === 0 ? (
                              <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                OUT OF STOCK
                              </span>
                            ) : l.quantityAvailable <= 5 ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                IN STOCK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-black text-emerald-950 text-sm">₹{l.sellingPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>🌱</span> Add New Agri Product to Catalog
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Bio-Neem Neem Seed Extract"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category *</label>
                    <select
                      name="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      name="brand"
                      required
                      placeholder="e.g. Kisan Agro"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Manufacturer *</label>
                    <input
                      type="text"
                      name="manufacturer"
                      required
                      placeholder="e.g. Kisan Chemicals India"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="Provide authentic product description, usage benefits, and technical specifications..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Active Ingredients</label>
                    <input
                      type="text"
                      name="activeIngredients"
                      placeholder="e.g. Azadirachtin 10000 ppm"
                      value={formData.activeIngredients}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Crops</label>
                    <input
                      type="text"
                      name="targetCrops"
                      placeholder="e.g. Paddy, Tomato, Chilli, Cotton"
                      value={formData.targetCrops}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Pests / Diseases</label>
                    <input
                      type="text"
                      name="targetPestsDiseases"
                      placeholder="e.g. Sucking Pests, Whitefly, Mites"
                      value={formData.targetPestsDiseases}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Pack Size *</label>
                    <input
                      type="number"
                      step="any"
                      name="packSize"
                      required
                      value={formData.packSize}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Pack Unit *</label>
                    <select
                      name="packUnit"
                      value={formData.packUnit}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl bg-white"
                    >
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="packet">packet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">MRP (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      name="mrp"
                      required
                      placeholder="1850"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="any"
                      name="sellingPrice"
                      required
                      placeholder="1650"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Stock Quantity (Units) *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      required
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SKU (Optional)</label>
                    <input
                      type="text"
                      name="sku"
                      placeholder="SKU-NEEM-1L"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border rounded-xl"
                    />
                  </div>
                </div>

                {/* Photo File Upload Section */}
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <label className="block font-bold text-emerald-900">Product Photo Upload (JPEG/PNG/WEBP, Max 5MB)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                    {uploadingImage && <span className="text-xs text-emerald-700 font-bold animate-pulse">Uploading photo...</span>}
                  </div>
                  {formData.imageUrl && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[11px] font-bold text-emerald-900">Uploaded URL:</span>
                      <code className="text-[10px] bg-white px-2 py-1 rounded border text-emerald-800 font-mono truncate max-w-xs">{formData.imageUrl}</code>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : '🚀 Submit for Admin Approval'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
