'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import { Layers, Plus, RefreshCw, FolderPlus } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  createdAt?: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Create Category Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [creating, setCreating] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    const res = await apiFetch<Category[]>('/api/v1/marketplace/categories');

    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
    } else {
      setError(res.error || 'Failed to fetch product categories');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const res = await apiFetch('/api/v1/admin/marketplace/categories', {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug,
        description: description || undefined,
        parentId: parentId || undefined,
      }),
    });

    if (res.success) {
      setToast({
        title: 'Category Created',
        message: `Category "${name}" added to marketplace taxonomy`,
        type: 'success',
      });
      setShowModal(false);
      setName('');
      setSlug('');
      setDescription('');
      setParentId('');
      fetchCategories();
    } else {
      setToast({
        title: 'Creation Failed',
        message: res.error || 'Failed to create category',
        type: 'error',
      });
    }

    setCreating(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            Marketplace Category Taxonomy Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage agri product categories, seeds, fertilizers, pesticides, and equipment taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Category
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Categories Unavailable" message={error} onRetry={fetchCategories} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Product Categories Found"
          description="No categories exist in the marketplace taxonomy."
          icon={<Layers className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Parent ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-emerald-600" />
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{cat.slug}</td>
                    <td className="px-4 py-3 text-slate-500">{cat.description || 'No description'}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{cat.parentId || 'Top Level'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Create Product Category
            </h3>
            <p className="text-xs text-slate-500">
              Add a new category to the agricultural marketplace taxonomy.
            </p>

            <TextInput
              label="Category Name"
              required
              placeholder="e.g., Organic Bio-Fertilizers"
              value={name}
              onChange={handleNameChange}
            />

            <TextInput
              label="URL Slug"
              required
              placeholder="organic-bio-fertilizers"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category summary and target usage..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parent Category (Optional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Top Level Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
