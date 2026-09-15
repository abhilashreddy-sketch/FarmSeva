'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, User as UserIcon, Phone, Mail, Lock, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/config/api';

export default function DeliveryRegisterPage() {
  const { setSession } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          vehicleType,
          vehicleNumber,
          activeDistrict,
          phone,
          email: email || undefined,
          password,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.data?.accessToken) {
        setSession(data.data.accessToken, data.data.user);
        router.push('/delivery');
      } else {
        setErrorMsg(data.error?.message || 'Delivery partner registration failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Unable to connect to FARM SEVA server.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-purple-200">
          <Truck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">DELIVERY PARTNER REGISTRATION</h1>
        <p className="text-sm font-medium text-slate-600">
          Become a last-mile delivery partner for agricultural inputs in your district.
        </p>
      </div>

      <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-md p-6 sm:p-8 bg-white shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Driver Full Name"
            type="text"
            placeholder="Suresh Reddy"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
            >
              <option value="Bike">Motorcycle / Scooter</option>
              <option value="Auto">Auto Rickshaw / Cargo Three Wheeler</option>
              <option value="Pickup Truck">Pickup Truck / Tata Ace</option>
            </select>
          </div>

          <Input
            label="Vehicle Registration Number"
            type="text"
            placeholder="AP 39 AB 1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
            leftIcon={<Truck className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Active Operating District"
            type="text"
            placeholder="Warangal, Guntur, Nashik..."
            value={activeDistrict}
            onChange={(e) => setActiveDistrict(e.target.value)}
            required
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Mobile Phone Number"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="driver@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md bg-purple-700 hover:bg-purple-800 border-purple-800" isLoading={isSubmitting}>
            Register Delivery Partner
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Already registered?{' '}
          <Link href="/delivery/login" className="text-purple-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </Card>
    </div>
  );
}
