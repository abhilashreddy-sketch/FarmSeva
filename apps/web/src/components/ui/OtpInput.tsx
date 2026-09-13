'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  onResend?: () => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  onResend,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const char = val[val.length - 1];
    const newOtp = value.split('');
    newOtp[index] = char;
    const combined = newOtp.join('');
    onChange(combined);

    if (index < length - 1 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      const newOtp = value.split('');
      newOtp[index] = '';
      onChange(newOtp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  const handleResendClick = () => {
    if (resendTimer === 0 && onResend) {
      onResend();
      setResendTimer(30);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[idx] || ''}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            className="w-11 h-13 sm:w-13 sm:h-14 text-center font-black text-xl sm:text-2xl text-emerald-950 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none disabled:opacity-50 select-none shadow-sm"
          />
        ))}
      </div>

      {onResend && (
        <div className="text-center text-xs font-semibold text-slate-500">
          {resendTimer > 0 ? (
            <span>Resend OTP code in <strong className="text-emerald-700 font-bold">{resendTimer}s</strong></span>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              className="text-emerald-600 hover:text-emerald-700 font-bold underline transition"
            >
              Didn't receive code? Resend OTP
            </button>
          )}
        </div>
      )}
    </div>
  );
};
