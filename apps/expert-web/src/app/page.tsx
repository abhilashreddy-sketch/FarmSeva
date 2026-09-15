'use client';

import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { Stethoscope, FileText, CheckCircle2, ArrowRight, ShieldCheck, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ExpertHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-sky-700">
        <div className="flex items-center gap-2">
          <Badge status="processing" className="bg-sky-500/20 text-sky-200 border-sky-400/30">
            Agronomist & Pathology Workstation
          </Badge>
          <span className="text-xs text-sky-300 font-bold">• API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA EXPERT
        </h1>
        <p className="text-sky-100 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Certified Agronomist & Plant Pathology Workstation. Triage farmer crop disease cases, verify AI diagnostic models, and prescribe scientific treatment guidelines with precise dosage.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-sky-400 text-sky-950 hover:bg-sky-300 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Agronomist Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Expert License
            </Button>
          </Link>
        </div>
      </div>

      {/* Specialty Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Case Evaluation Desk"
          value="Clinical Queue"
          subtitle="Real-time farmer crop triage"
          icon={<Stethoscope className="w-5 h-5 text-sky-600" />}
        />
        <MetricCard
          title="AI Vision Inspection"
          value="Multimodal AI"
          subtitle="Pre-screened disease confidence"
          icon={<Activity className="w-5 h-5 text-sky-600" />}
        />
        <MetricCard
          title="Regional Advisories"
          value="Pest Alerts"
          subtitle="District-level crop health bulletins"
          icon={<AlertTriangle className="w-5 h-5 text-sky-600" />}
        />
      </div>

      {/* Information Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="TRIAGE DESK"
          title="Farmer Crop Submissions"
          description="Inspect high-resolution crop photos, field symptoms, and disease history submitted directly by registered farmers."
          icon={<Stethoscope className="w-6 h-6 text-sky-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-sky-600 text-sky-700 hover:bg-sky-50">
                Access Cases Desk
              </Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="PATHOLOGY GUIDANCE"
          title="Scientific Treatment & Dosage"
          description="Formulate binding recommendations covering chemical fungicides, biological pesticides, dosage timing, and safety periods."
          icon={<FileText className="w-6 h-6 text-sky-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-sky-600 text-sky-700 hover:bg-sky-50">
                Issue Guidance
              </Button>
            </Link>
          }
        />
      </div>

      {/* Quality & Credential Callout */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm">Certified Agronomist Network</h3>
          </div>
          <p className="text-xs text-slate-400">
            All expert guidance issued on FARM SEVA requires verified agricultural license credentials and adherence to agricultural safety guidelines.
          </p>
        </div>
        <Link href="/register">
          <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold whitespace-nowrap">
            Verify License
          </Button>
        </Link>
      </div>
    </div>
  );
}
