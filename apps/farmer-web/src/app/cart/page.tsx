'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Badge,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await apiFetch<any>('/api/v1/cart');
    if (res.success && res.data) {
      setCart(res.data);
    } else if (!res.success) {
      setError(res.error || 'Unable to load shopping cart.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    const res = await apiFetch(`/api/v1/cart/items/${itemId}`, { method: 'DELETE' });
    if (res.success) {
      loadCart();
    }
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setError(null);

    const res = await apiFetch('/api/v1/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((i: any) => ({
          productId: i.productId || i.product?.id,
          quantity: i.quantity,
        })),
      }),
    });

    setIsSubmitting(false);
    if (res.success) {
      router.push('/orders');
    } else {
      setError(res.error || 'Checkout failed. Please ensure your delivery address is configured.');
    }
  };

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to view your shopping cart and place marketplace orders."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  const items = cart?.items || cart?.cartItems || [];
  const subtotal = items.reduce(
    (acc: number, item: any) => acc + (item.product?.price || item.price || 0) * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="active">Shopping Cart</Badge>
        <h1 className="text-2xl font-black text-slate-900">Your Agricultural Cart</h1>
        <p className="text-xs text-slate-500">
          Review selected seeds, fertilizers, and tools before submitting district order.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCart} />
      ) : items.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm divide-y divide-slate-100">
            {items.map((item: any) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">{item.product?.name || 'Agricultural Input'}</h3>
                  <p className="text-xs text-slate-500">
                    ₹{item.product?.price || item.price} × {item.quantity} units
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-black text-slate-900 text-sm">
                    ₹{(item.product?.price || item.price || 0) * item.quantity}
                  </p>
                  <Button
                    variant="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Remove item"
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>District Delivery Charges</span>
                <span className="font-bold text-emerald-700">Calculated at dispatch</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Estimated Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              onClick={handleCheckout}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Order & Request Dispatch
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Your Cart is Empty"
          description="Browse the district marketplace to add certified seeds, bio-pesticides, and fertilizers."
          actionLabel="Browse Marketplace"
          onAction={() => router.push('/products')}
        />
      )}
    </div>
  );
}
