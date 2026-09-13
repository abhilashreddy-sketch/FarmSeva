'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function FarmerCartPage() {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchCart();
    else setLoading(false);
  }, [token]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCart(data.data);
      else setError(data.error?.message || 'Failed to load cart');
    } catch (err: any) {
      setError('Error connecting to cart service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQty: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) fetchCart();
    } catch (err: any) {
      alert('Failed to update item quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchCart();
    } catch (err: any) {
      alert('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-4">
        <Skeleton variant="card" className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" className="lg:col-span-2 h-64" />
          <Skeleton variant="card" className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Badge variant="harvest" size="md">FARMER SHOPPING CART</Badge>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" /> Your Shopping Cart
          </h1>
        </div>
        <Link href="/farmer/marketplace">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Cart is Currently Empty"
          description="Explore our crop protection marketplace to discover certified pesticides, bio-products, and growth enhancers."
          actionLabel="Browse Marketplace →"
          onAction={() => window.location.href = '/farmer/marketplace'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item: any) => (
              <Card key={item.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl p-2 flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="max-h-full object-contain" />
                    ) : (
                      <span className="text-2xl">🧪</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase">{item.brand}</span>
                    <Link href={`/farmer/marketplace/products/${item.productSlug}`}>
                      <h4 className="text-sm font-black text-slate-900 hover:text-emerald-700 transition">
                        {item.productName}
                      </h4>
                    </Link>
                    <p className="text-xs text-slate-500 font-medium">Dealer: <strong>{item.shopName}</strong></p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 font-black text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-extrabold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 font-black text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Subtotal</span>
                    <span className="text-base font-black text-slate-900">₹{item.subtotal}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card padding="md" className="space-y-4 h-fit">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Total Summary
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Total Items</span>
                <span className="font-bold text-slate-900">{cart.summary.totalItemsCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Amount</span>
                <span className="font-bold text-slate-900">₹{cart.summary.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>District Logistics</span>
                <span className="font-bold text-emerald-700">Farm-Gate OTP Delivery</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-emerald-950">₹{cart.summary.totalAmount}</span>
            </div>

            <Link href="/farmer/checkout" className="block w-full">
              <Button variant="harvest" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Checkout
              </Button>
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
