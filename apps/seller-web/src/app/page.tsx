import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { Store, Package, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SellerHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-amber-600">
        <div className="flex items-center gap-2">
          <Badge status="pending">Agri Dealer Application</Badge>
          <span className="text-xs text-amber-200 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA SELLER
        </h1>
        <p className="text-amber-100 text-sm font-medium max-w-2xl leading-relaxed">
          Licensed Retail Shop Console. Manage inventory stock, list certified agricultural seeds and fertilizers, and fulfill district farmer orders.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-amber-400 text-amber-950 hover:bg-amber-300" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Seller Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Agri Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Stock Management"
          value="Inventory Console"
          subtitle="Real-time stock updates"
          icon={<Package className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="District Orders"
          value="Fulfillment Desk"
          subtitle="Direct farmer connections"
          icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="KYC Verification"
          value="License Gate"
          subtitle="Admin approved seller network"
          icon={<Store className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="INVENTORY"
          title="Product Catalog & Pricing"
          description="Maintain authentic brand listings with transparent local stock and government licensed pricing."
          icon={<Package className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Manage Catalog</Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="FULFILLMENT"
          title="Order Processing & Dispatch"
          description="Receive instant notifications for farmer orders and coordinate last-mile pickup with Delivery Partners."
          icon={<ShoppingCart className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">View Orders</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
