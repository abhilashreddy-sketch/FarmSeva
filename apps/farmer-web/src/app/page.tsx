import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
  SearchInput,
} from '@farm-seva/shared-ui';
import { Sprout, ShoppingBag, Stethoscope, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FarmerHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Badge status="active">Customer Application</Badge>
          <span className="text-xs text-emerald-200 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA FARMER
        </h1>
        <p className="text-emerald-100 text-sm font-medium max-w-2xl leading-relaxed">
          Buy certified seeds, fertilizers, and equipment from verified district sellers. Get AI-powered crop disease diagnosis and expert agronomist advice.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Farmer Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Search */}
      <div className="max-w-xl">
        <SearchInput placeholder="Search verified seeds, pesticides, or crop diseases..." />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Verified Products"
          value="Catalog Ready"
          subtitle="Direct from licensed dealers"
          icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Crop Doctor"
          value="Gemini AI"
          subtitle="Multimodal disease diagnosis"
          icon={<Sprout className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Expert Network"
          value="Certified"
          subtitle="Agronomists & Pathologists"
          icon={<Stethoscope className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="BUY INPUTS"
          title="District Agri Marketplace"
          description="Access authentic products from verified retail dealers near your block with price transparency."
          icon={<ShoppingBag className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Browse Products</Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="CROP CARE"
          title="AI Crop Doctor & Advisory"
          description="Upload plant photos for immediate disease diagnosis and scientific prescription guidance."
          icon={<Sprout className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Check Crop Health</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
