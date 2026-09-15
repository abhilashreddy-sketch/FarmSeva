'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import { ShoppingCart, CheckCircle2, ShieldCheck, Store, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch<any>(`/api/v1/marketplace/products/${productId}`);
      if (res.success && res.data) {
        setProduct(res.data);
      } else {
        setError(res.error || 'Product details could not be found.');
      }
      setIsLoading(false);
    }
    if (productId) loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setIsAdding(true);
    const res = await apiFetch('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity }),
    });

    setIsAdding(false);
    if (res.success) {
      setToastMessage('Product added to your cart successfully!');
    } else {
      setError(res.error || 'Failed to add item to cart.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorState
          type="404"
          title="Product Not Found"
          message={error || 'The requested product is unavailable.'}
          onRetry={() => router.push('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge status="verified">Licensed District Product</Badge>
          <span className="text-xs font-bold text-slate-500">
            {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">{product.name}</h1>
          <p className="text-xs text-slate-500 font-medium">Category: {product.category?.name || 'Agricultural Input'}</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Price per unit</span>
            <p className="text-3xl font-black text-slate-900">₹{product.price}</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Quantity:</label>
            <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="px-3 py-1.5 text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Product Description & Usage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description || 'Verified agricultural input supplied by licensed retail dealers. Formulated for high crop yield performance.'}
          </p>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-950">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>FARM SEVA Authenticity Guarantee</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Purchases from verified district dealers include genuine batch codes and government-compliant retail invoices.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="lg"
            isLoading={isAdding}
            onClick={handleAddToCart}
            leftIcon={<ShoppingCart className="w-5 h-5" />}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800"
          >
            Add to Cart (₹{product.price * quantity})
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              handleAddToCart().then(() => router.push('/cart'));
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>

      {toastMessage && (
        <Toast
          type="success"
          title="Cart Updated"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
