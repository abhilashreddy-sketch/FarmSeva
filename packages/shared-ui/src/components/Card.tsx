import React from 'react';

export interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<BaseCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm ${
        hoverable || onClick ? 'hover:shadow-md hover:border-slate-300 transition cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  subtitle,
}) => {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
        {icon && <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">{icon}</div>}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-bold px-1.5 py-0.5 rounded-md ${
                isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};

export interface InformationCardProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const InformationCard: React.FC<InformationCardProps> = ({
  title,
  description,
  badgeText,
  icon,
  action,
}) => {
  return (
    <Card>
      <div className="flex items-start gap-4">
        {icon && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">{icon}</div>}
        <div className="space-y-1 flex-1">
          {badgeText && (
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase mb-1">
              {badgeText}
            </span>
          )}
          <h3 className="font-bold text-slate-900 text-base">{title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>
    </Card>
  );
};
