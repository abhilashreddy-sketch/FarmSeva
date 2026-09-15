'use client';

import React, { useEffect, useState } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Badge,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ArrowLeft, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [packSize, setPackSize] = useState('1');
  const [packUnit, setPackUnit] = useState('kg');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('50');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const res = await apiFetch<any[]>('/api/v1/marketplace/categories');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
        setCategoryId(res.data[0].id);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !description.trim() || !sellingPrice || !mrp) {
      setError('Please complete all required fields.');
      return;
    }

    if (parseFloat(sellingPrice) > parseFloat(mrp)) {
      setError('Selling price cannot exceed Maximum Retail Price (MRP).');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      name,
      categoryId,
      brand,
      manufacturer: manufacturer || brand,
      description,
      packSize: parseFloat(packSize) || 1,
      packUnit,
      mrp: parseFloat(mrp),
      sellingPrice: parseFloat(sellingPrice),
      stockQuantity: parseInt(stockQuantity, 10) || 50,
    };

    const res = await apiFetch('/api/v1/seller/marketplace/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setIsLoading(false);
    if (res.success) {
      router.push('/products');
    } else {
      setError(res.error || 'Failed to create product listing.');
    }
  };

  if (!getAuthToken()) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Catalog</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <Badge status="pending">New Product Form</Badge>
          <h1 className="text-xl font-black text-slate-900">Add Product to Shop Catalog</h1>
          <p className="text-xs text-slate-500">
            Provide authentic agricultural input details for district farmer listing.
          </p>
        </div>

        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Product Name"
            required
            placeholder="e.g. BPT 5204 Paddy Seeds 10kg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {categories.length > 0 && (
            <Select
              label="Product Category"
              required
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Brand Name"
              required
              placeholder="e.g. Syngenta or Bayer"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <TextInput
              label="Manufacturer Name"
              placeholder="e.g. Syngenta India Ltd"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
          </div>

          <Textarea
            label="Product Description & Dosage"
            required
            placeholder="Specify application usage, dosage per acre, and safety recommendations..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Pack Size"
              type="number"
              required
              value={packSize}
              onChange={(e) => setPackSize(e.target.value)}
            />

            <Select
              label="Pack Unit"
              required
              options={[
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'g', label: 'Gram (g)' },
                { value: 'L', label: 'Liter (L)' },
                { value: 'ml', label: 'Milliliter (ml)' },
                { value: 'unit', label: 'Unit / Piece' },
              ]}
              value={packUnit}
              onChange={(e) => setPackUnit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <TextInput
              label="MRP (₹)"
              type="number"
              required
              placeholder="e.g. 500"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
            />

            <TextInput
              label="Selling Price (₹)"
              type="number"
              required
              placeholder="e.g. 450"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />

            <TextInput
              label="Initial Stock"
              type="number"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/products">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isLoading} className="bg-amber-600 hover:bg-amber-700 text-white" leftIcon={<Plus className="w-4 h-4" />}>
              Publish Product Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
