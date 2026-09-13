'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function FarmerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);

  useEffect(() => {
    if (token && params.id) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [token, params.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/farmer/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.error?.message || 'Failed to load order details');
      }
    } catch (err) {
      setError('Error connecting to order service');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? Stock will be released back to the shop.')) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/farmer/orders/${params.id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert('Order cancelled successfully');
        fetchOrderDetails();
      } else {
        alert(data.error?.message || 'Failed to cancel order');
      }
    } catch (err) {
      alert('Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl animate-spin inline-block">⏳</span>
            <p className="mt-2 font-bold text-gray-600">Loading Order Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center">
            <p className="font-bold text-base">⚠️ {error || 'Order not found'}</p>
            <Link href="/farmer/orders" className="mt-4 inline-block bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-xs">
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = ['DRAFT', 'PENDING_ACCEPTANCE', 'ACCEPTED'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/farmer/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mb-1">
              ⬅ Back to All Orders
            </Link>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>📜</span> Order #{order.id.slice(0, 8)}
            </h1>
          </div>
          {canCancel && (
            <button
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-4 py-2 rounded-xl text-xs"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Status</span>
              <h3 className="text-lg font-extrabold text-emerald-800">{order.status.replace(/_/g, ' ')}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Payment Mode</span>
              <p className="font-extrabold text-gray-900 text-sm">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Delivery OTP Notice */}
          {order.delivery?.deliveryOtpHash && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-900 text-sm">🔑 Delivery OTP Security</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Share your 6-digit OTP with the delivery partner upon drop-off to complete delivery.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Address & Retailer Shop Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">📍 Delivery Address</h4>
            <p className="font-bold text-gray-900 text-sm">{order.deliveryAddress?.fullName}</p>
            <p className="text-xs text-gray-600 mt-0.5">📞 {order.deliveryAddress?.phone}</p>
            <p className="text-xs text-gray-700 mt-2 leading-relaxed">
              {order.deliveryAddress?.addressLine1}, {order.deliveryAddress?.villageOrCity}, {order.deliveryAddress?.district}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2">🏬 Retailer Shop</h4>
            <p className="font-bold text-gray-900 text-sm">{order.sellerShop?.shopName}</p>
            <p className="text-xs text-gray-600 mt-0.5">📍 {order.sellerShop?.city}, {order.sellerShop?.state}</p>
            <p className="text-xs text-emerald-700 font-semibold mt-2">Verified Agro-Retailer Partner</p>
          </div>
        </div>

        {/* Items Invoice Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <h4 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <span>🛒</span> Ordered Products
          </h4>
          <div className="divide-y border-t border-b">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-gray-900">{item.product?.name}</h5>
                  <p className="text-gray-500">Pack: {item.variant?.packSize} {item.variant?.unit}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-900">₹{item.unitPrice.toFixed(2)} x {item.quantity}</span>
                  <p className="font-extrabold text-emerald-700 text-sm">₹{item.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 text-sm font-extrabold text-gray-900">
            <span>Total Payable Amount</span>
            <span className="text-xl text-emerald-800">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
