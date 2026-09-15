import React from 'react';

export type StatusVariant =
  | 'success'
  | 'pending'
  | 'processing'
  | 'warning'
  | 'cancelled'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'verified'
  | 'unverified';

export interface BadgeProps {
  status?: StatusVariant;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'active',
  children,
  size = 'md',
  className = '',
}) => {
  const styles: Record<StatusVariant, string> = {
    success: 'bg-green-100 text-green-800 border-green-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    verified: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-sky-100 text-sky-800 border-sky-200',
    warning: 'bg-amber-100 text-amber-900 border-amber-300',
    cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    unverified: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const label = children || status.toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border uppercase tracking-wider ${sizeStyles[size]} ${styles[status]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {label}
    </span>
  );
};
