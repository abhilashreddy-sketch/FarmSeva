import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { Stethoscope, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ExpertHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-blue-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-sky-700">
        <div className="flex items-center gap-2">
          <Badge status="processing">Agronomist Workstation</Badge>
          <span className="text-xs text-sky-200 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA EXPERT
        </h1>
        <p className="text-sky-100 text-sm font-medium max-w-2xl leading-relaxed">
          Certified Agronomist & Pathologist Console. Review farmer crop disease submissions, verify AI diagnostics, and issue formal medical treatment guidelines.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-sky-400 text-sky-950 hover:bg-sky-300" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Expert Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Expert Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Case Queue"
          value="Advisory Desk"
          subtitle="Real-time farmer submissions"
          icon={<FileText className="w-5 h-5 text-sky-600" />}
        />
        <MetricCard
          title="Pathology Audit"
          value="AI Verification"
          subtitle="Multimodal crop inspection"
          icon={<Stethoscope className="w-5 h-5 text-sky-600" />}
        />
        <MetricCard
          title="Agronomy Network"
          value="Certified"
          subtitle="University & ICAR experts"
          icon={<CheckCircle className="w-5 h-5 text-sky-600" />}
        />
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="DIAGNOSTICS"
          title="Farmer Crop Submissions"
          description="Review high-resolution plant imagery, soil parameters, and crop history to formulate accurate prescriptions."
          icon={<Stethoscope className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Open Workstation</Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="ADVISORY"
          title="Treatment Guidance & Dosage"
          description="Issue formal recommendations on bio-pesticides, fungicides, and agricultural practices to protect harvest yields."
          icon={<FileText className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Issue Advisory</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
