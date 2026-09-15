import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 shadow-2xs">
        {icon || <Inbox className="w-8 h-8 text-slate-400" aria-hidden="true" />}
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
