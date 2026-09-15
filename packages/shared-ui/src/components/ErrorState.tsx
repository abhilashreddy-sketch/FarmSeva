import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  type?: 'inline' | 'api' | 'page' | 'network' | 'permission' | '404';
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'page',
  title,
  message,
  onRetry,
  className = '',
}) => {
  const getDefaults = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-8 h-8 text-amber-600" />,
          title: title || 'Network Connection Issue',
          message: message || 'Please check your internet connection and try reloading.',
        };
      case 'permission':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
          title: title || 'Access Restricted',
          message: message || 'You do not have permission to view this section.',
        };
      case '404':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-slate-500" />,
          title: title || 'Page Not Found',
          message: message || 'The requested section or resource could not be found.',
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
          title: title || 'Something went wrong',
          message: message || 'An unexpected error occurred. Please try again.',
        };
    }
  };

  const config = getDefaults();

  if (type === 'inline') {
    return (
      <div className={`p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-800 ${className}`}>
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
        <span className="font-medium">{config.message}</span>
      </div>
    );
  }

  return (
    <div
      className={`border border-red-200 rounded-2xl p-8 sm:p-12 text-center bg-red-50/40 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="p-3 bg-white border border-red-100 rounded-2xl shadow-xs">{config.icon}</div>

      <div className="max-w-md space-y-1">
        <h3 className="font-bold text-slate-900 text-base">{config.title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{config.message}</p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
