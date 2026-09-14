'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: 'FARMER' | 'SELLER' | 'AGRICULTURAL_EXPERT' | 'DELIVERY_PARTNER' | 'ADMIN' | 'CALL_CENTER_AGENT';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'REJECTED' | 'DEACTIVATED';
  preferredLanguage: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginPhone: (phone: string, password?: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
  loginEmail: (email: string, password?: string, otp?: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (identifier: string, purpose?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (identifier: string, otp: string, purpose?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  getRoleDashboardPath: (role: string, status: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_BASE_URL } from '@/config/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getRoleDashboardPath = (role: string, status: string): string => {
    if (status === 'SUSPENDED') return '/account-suspended';
    if (status === 'PENDING_VERIFICATION') return '/account-pending';
    if (status === 'REJECTED' || status === 'DEACTIVATED') return '/unauthorized';

    switch (role) {
      case 'FARMER':
        return '/farmer';
      case 'SELLER':
        return '/seller';
      case 'AGRICULTURAL_EXPERT':
        return '/expert';
      case 'DELIVERY_PARTNER':
        return '/delivery';
      case 'CALL_CENTER_AGENT':
        return '/call-center';
      case 'ADMIN':
        return '/admin';
      default:
        return '/unauthorized';
    }
  };

  // Hydrate auth state from localStorage on load
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('farm_seva_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          } else {
            localStorage.removeItem('farm_seva_token');
            setToken(null);
          }
        } catch (e) {
          console.error('Failed to verify stored session:', e);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const handleAuthSuccess = (loggedInUser: User, accessToken: string) => {
    setUser(loggedInUser);
    setToken(accessToken);
    localStorage.setItem('farm_seva_token', accessToken);
    const targetPath = getRoleDashboardPath(loggedInUser.role, loggedInUser.status);
    router.push(targetPath);
  };

  const login = async (phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error?.message || 'Login failed' };
      }

      handleAuthSuccess(data.data.user, data.data.accessToken);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Unable to connect to FARM SEVA. Please try again.' };
    }
  };

  const loginPhone = async (phone: string, password?: string, otp?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login/phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, otp }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error?.message || 'Phone login failed' };
      }

      handleAuthSuccess(data.data.user, data.data.accessToken);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Unable to connect to FARM SEVA. Please try again.' };
    }
  };

  const loginEmail = async (email: string, password?: string, otp?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error?.message || 'Invalid email or password' };
      }

      handleAuthSuccess(data.data.user, data.data.accessToken);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Unable to connect to FARM SEVA. Please try again.' };
    }
  };

  const sendOtp = async (identifier: string, purpose: string = 'LOGIN') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, purpose }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error?.message || 'Failed to send OTP' };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Network error sending OTP' };
    }
  };

  const verifyOtp = async (identifier: string, otp: string, purpose: string = 'LOGIN') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp, purpose }),
      });

      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error?.message || 'OTP verification failed' };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Network error verifying OTP' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('Error logging out:', e);
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('farm_seva_token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginPhone,
        loginEmail,
        sendOtp,
        verifyOtp,
        logout,
        setUser,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
