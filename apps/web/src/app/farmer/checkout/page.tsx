'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, MapPin, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function FarmerCheckoutPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('COD');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<any>(null);

  useEffect(() => {
    if (token) fetchData();
    else setLoading(false);
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cartRes, addrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/cart`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/addresses`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const cartData = await cartRes.json();
      const addrData = await addrRes.json();

      if (cartData.success) setCart(cartData.data);
      if (addrData.success && addrData.data.length > 0) {
        setAddresses(addrData.data);
        const defaultAddr = addrData.data.find((a: any) => a.isDefault) || addrData.data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      setError('Failed to initialize checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCheckoutResult(data.data);
        setStep(4);
      } else {
        setError(data.error?.message || 'Checkout failed');
        if (data.error?.code === 'PRICE_CHANGED' || data.error?.code === 'INVENTORY_UNAVAILABLE') {
          fetchData();
        }
      }
    } catch (err) {
      setError('Network error placing order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-bold text-slate-500">Preparing Checkout...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Step Indicator Bar */}
      <Card padding="sm" className="bg-white">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-emerald-700 font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Review Items</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-emerald-700 font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Address</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-emerald-700 font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Payment</span>
          </div>
          <span className="text-slate-300">───</span>
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-emerald-700 font-black' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span>Confirmation</span>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 underline">Dismiss</button>
        </div>
      )}

      {/* STEP 1: REVIEW ITEMS */}
      {step === 1 && (
        <Card padding="md" className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" /> Step 1: Review Order Items
          </h2>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-bold">Your cart is empty.</div>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100 py-2">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.product?.name}</h4>
                      <p className="text-slate-500 font-medium">Dealer: {item.sellerShop?.shopName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{item.priceAtAdd} x {item.quantity}</p>
                      <p className="font-black text-emerald-700 text-sm">₹{(item.priceAtAdd * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm">Subtotal Payable</span>
                <span className="text-2xl font-black text-emerald-950">₹{cart.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between pt-2">
                <Link href="/farmer/cart">
                  <Button variant="ghost" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Cart</Button>
                </Link>
                <Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Select Address
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 2: ADDRESS SELECTION */}
      {step === 2 && (
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Step 2: Select Delivery Address
            </h2>
            <Link href="/farmer/addresses" className="text-xs font-bold text-emerald-600 hover:underline">
              + Add Address
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
              <p className="text-xs font-bold text-amber-900">No delivery address found.</p>
              <Link href="/farmer/addresses">
                <Button variant="harvest" size="sm" className="mt-2">Add Delivery Address</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`border rounded-2xl p-4 cursor-pointer flex items-start gap-3 transition ${
                    selectedAddressId === addr.id ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 text-emerald-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                    <span className="text-xs text-slate-500 font-medium ml-2">({addr.phone})</span>
                    <p className="text-xs text-slate-600 mt-1">
                      {addr.addressLine1}, {addr.villageOrCity}, {addr.district}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Items
            </Button>
            <Button variant="primary" size="md" disabled={!selectedAddressId} onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Proceed to Payment
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: PAYMENT METHOD */}
      {step === 3 && (
        <Card padding="md" className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Step 3: Payment Mode
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`border rounded-2xl p-4 cursor-pointer flex items-start gap-3 transition ${
                paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="mt-1 text-emerald-600"
              />
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">💵 Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Pay cash to delivery partner upon OTP verification at farm-gate.</p>
              </div>
            </label>

            <label
              className={`border rounded-2xl p-4 cursor-pointer flex items-start gap-3 transition ${
                paymentMethod === 'RAZORPAY' ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'RAZORPAY'}
                onChange={() => setPaymentMethod('RAZORPAY')}
                className="mt-1 text-emerald-600"
              />
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">⚡ Online Digital Payment</h4>
                <p className="text-xs text-slate-500 mt-0.5">UPI, Debit/Credit Card, NetBanking via Razorpay.</p>
              </div>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <Button variant="ghost" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Address
            </Button>
            <Button variant="harvest" size="lg" isLoading={submitting} onClick={handlePlaceOrder}>
              🔒 Confirm & Place Order
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: ORDER CONFIRMED */}
      {step === 4 && checkoutResult && (
        <Card padding="lg" className="text-center space-y-4 border-emerald-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>

          {checkoutResult.orders?.[0]?.rawDeliveryOtp && (
            <Card padding="md" className="bg-amber-50 border-amber-300 max-w-sm mx-auto space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase">🔑 Village Delivery OTP</span>
              <div className="text-3xl font-black text-amber-950 tracking-widest my-1">
                {checkoutResult.orders[0].rawDeliveryOtp}
              </div>
              <p className="text-[11px] text-amber-800 font-medium">Share this 6-digit code with the delivery partner upon drop-off.</p>
            </Card>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <Link href="/farmer/orders">
              <Button variant="primary" size="md">Track Orders</Button>
            </Link>
            <Link href="/farmer/marketplace">
              <Button variant="ghost" size="md">Back to Marketplace</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
