'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Lock, ShieldCheck, MapPin, Building2, Award, Truck, Sprout, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OtpInput } from '../../components/ui/OtpInput';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type RoleType = 'FARMER' | 'SELLER' | 'AGRICULTURAL_EXPERT' | 'DELIVERY_PARTNER';

import { API_BASE_URL } from '@/config/api';

export default function RegisterPage() {
  const { t } = useLanguage();
  const { sendOtp, verifyOtp, setUser } = useAuth();
  const router = useRouter();

  // Stepper State: 1 = Role, 2 = Basic Account, 3 = OTP Verification, 4 = Role Details, 5 = Complete
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>('FARMER');

  // Form Fields - Common
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [state, setState] = useState('Telangana');
  const [district, setDistrict] = useState('Warangal');
  const [village, setVillage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Role Specific Fields
  // Farmer
  const [experienceYears, setExperienceYears] = useState('5');
  const [totalLandAcres, setTotalLandAcres] = useState('3.5');
  const [primaryWaterSource, setPrimaryWaterSource] = useState('Borewell');

  // Seller
  const [businessName, setBusinessName] = useState('');
  const [pesticideLicenseNo, setPesticideLicenseNo] = useState('');
  const [fertilizerLicenseNo, setFertilizerLicenseNo] = useState('');
  const [shopName, setShopName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [taluk, setTaluk] = useState('');
  const [pincode, setPincode] = useState('');

  // Expert
  const [specialization, setSpecialization] = useState('Pathology');
  const [qualification, setQualification] = useState('M.Sc. Agriculture (Plant Pathology)');
  const [certificationNo, setCertificationNo] = useState('');
  const [yearsExperience, setYearsExperience] = useState('6');

  // Delivery Partner
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('Warangal');

  // UI Error & Loading
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Handle Step 2 -> Step 3
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required account fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    setCurrentStep(3);
  };

  // Handle OTP Send
  const handleSendOtpCode = async () => {
    setErrorMsg('');
    setIsSendingOtp(true);
    const result = await sendOtp(phone, 'REGISTER');
    setIsSendingOtp(false);

    if (result.success) {
      setOtpSent(true);
    } else {
      setErrorMsg(result.error || 'Failed to send OTP code.');
    }
  };

  // Handle OTP Verification
  const handleVerifyOtpCode = async () => {
    setErrorMsg('');
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyOtp(phone, otpCode, 'REGISTER');
    setIsSubmitting(false);

    if (result.success) {
      setOtpVerified(true);
      setCurrentStep(4);
    } else {
      setErrorMsg(result.error || 'Invalid OTP code.');
    }
  };

  // Final Registration API Submission
  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    let endpoint = '';
    let body: any = {
      phone,
      fullName,
      password,
      preferredLanguage,
    };
    if (email) body.email = email;

    if (selectedRole === 'FARMER') {
      endpoint = '/api/v1/auth/register/farmer';
      body.experienceYears = parseInt(experienceYears, 10) || 1;
      body.totalLandAcres = parseFloat(totalLandAcres) || 1;
      body.primaryWaterSource = primaryWaterSource;
    } else if (selectedRole === 'SELLER') {
      endpoint = '/api/v1/auth/register/seller';
      body.businessName = businessName || `${fullName} Agri Store`;
      body.pesticideLicenseNo = pesticideLicenseNo || 'PEST-LIC-999';
      body.fertilizerLicenseNo = fertilizerLicenseNo || undefined;
      body.shopName = shopName || `${fullName} Retail Shop`;
      body.addressLine = addressLine || village || 'Main Road';
      body.taluk = taluk || district;
      body.district = district;
      body.state = state;
      body.pincode = pincode || '506001';
      body.contactPhone = phone;
    } else if (selectedRole === 'AGRICULTURAL_EXPERT') {
      endpoint = '/api/v1/auth/register/expert';
      body.specialization = specialization;
      body.qualification = qualification;
      body.certificationNo = certificationNo || undefined;
      body.yearsExperience = parseInt(yearsExperience, 10) || 5;
    } else if (selectedRole === 'DELIVERY_PARTNER') {
      endpoint = '/api/v1/auth/register/delivery';
      body.vehicleType = vehicleType;
      body.vehicleNumber = vehicleNumber || 'TS-03-AB-1234';
      body.activeDistrict = activeDistrict || district;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        setErrorMsg(data.error?.message || 'Registration failed.');
        return;
      }

      setCurrentStep(5);

      // Auto redirect after 2.5 seconds
      setTimeout(() => {
        if (selectedRole === 'DELIVERY_PARTNER') {
          router.push('/kyc');
        } else {
          router.push('/login');
        }
      }, 2500);

    } catch (e: any) {
      setIsSubmitting(false);
      setErrorMsg('Network error connecting to Farm Seva API server.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* STEPPER HEADER PROGRESS BAR */}
      <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-3 px-1">
          <span className={currentStep >= 1 ? 'text-emerald-700 font-extrabold' : ''}>① Role</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className={currentStep >= 2 ? 'text-emerald-700 font-extrabold' : ''}>② Account</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className={currentStep >= 3 ? 'text-emerald-700 font-extrabold' : ''}>③ Verify</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className={currentStep >= 4 ? 'text-emerald-700 font-extrabold' : ''}>④ Profile</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className={currentStep >= 5 ? 'text-emerald-700 font-extrabold' : ''}>⑤ Done</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* STEP 1: ROLE SELECTION */}
      {currentStep === 1 && (
        <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Create your FARM SEVA Account
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Select your role on the platform to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FARMER */}
            <div
              onClick={() => setSelectedRole('FARMER')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 ${
                selectedRole === 'FARMER'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Farmer (రైతు / किसान)</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Buy certified agri-inputs, consult crop experts, and track order deliveries.
                </p>
              </div>
            </div>

            {/* SELLER */}
            <div
              onClick={() => setSelectedRole('SELLER')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 ${
                selectedRole === 'SELLER'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Agri Dealer / Seller</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Sell licensed seeds, fertilizers & crop protection products to local farmers.
                </p>
              </div>
            </div>

            {/* EXPERT */}
            <div
              onClick={() => setSelectedRole('AGRICULTURAL_EXPERT')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 ${
                selectedRole === 'AGRICULTURAL_EXPERT'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Crop Expert / Agronomist</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Provide diagnostic advice and scientific guidance for crop pest problems.
                </p>
              </div>
            </div>

            {/* DELIVERY PARTNER */}
            <div
              onClick={() => setSelectedRole('DELIVERY_PARTNER')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-4 ${
                selectedRole === 'DELIVERY_PARTNER'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Delivery Partner</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Deliver agri-inputs from local dealers directly to farm hubs and villages.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            onClick={() => setCurrentStep(2)}
          >
            Continue as {selectedRole.replace('_', ' ')} →
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-emerald-600 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </Card>
      )}

      {/* STEP 2: BASIC ACCOUNT FIELDS */}
      {currentStep === 2 && (
        <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Basic Account Creation</h2>
              <p className="text-xs text-slate-500 font-semibold">Enter your primary contact details</p>
            </div>
            <Badge variant="harvest" size="md">
              Role: {selectedRole}
            </Badge>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleProceedToOtp} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone Number"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                required
              />
              <Input
                label="Email Address (Optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 font-medium">
                I accept the FARM SEVA <Link href="/terms" className="text-emerald-600 underline font-bold">Terms & Conditions</Link> and <Link href="/privacy" className="text-emerald-600 underline font-bold">Privacy Policy</Link>.
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="w-1/3">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button type="submit" variant="primary" className="w-2/3">
                Verify Phone OTP →
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 3: OTP VERIFICATION */}
      {currentStep === 3 && (
        <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Phone className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Phone Verification</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Verify your mobile number ({phone}) to complete registration
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold text-left flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}



          {!otpSent ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSendingOtp}
              onClick={handleSendOtpCode}
            >
              Send 6-Digit OTP Code
            </Button>
          ) : (
            <div className="space-y-6">
              <OtpInput length={6} value={otpCode} onChange={setOtpCode} />
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                onClick={handleVerifyOtpCode}
              >
                Verify & Proceed to Profile Setup
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="text-xs text-slate-500 hover:underline font-bold"
          >
            ← Change phone number
          </button>
        </Card>
      )}

      {/* STEP 4: ROLE SPECIFIC PROFILE */}
      {currentStep === 4 && (
        <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Complete Your Profile</h2>
              <p className="text-xs text-slate-500 font-semibold">Role-specific business and agricultural information</p>
            </div>
            <Badge variant="success" size="md">
              ✓ Phone Verified
            </Badge>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleFinalRegistration} className="space-y-4">
            {/* FARMER FIELDS */}
            {selectedRole === 'FARMER' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Farming Experience (Years)"
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                  <Input
                    label="Total Farm Land (Acres)"
                    type="number"
                    step="0.1"
                    value={totalLandAcres}
                    onChange={(e) => setTotalLandAcres(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Water Source</label>
                  <select
                    value={primaryWaterSource}
                    onChange={(e) => setPrimaryWaterSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                    <option value="River">River/Stream</option>
                  </select>
                </div>
              </>
            )}

            {/* SELLER FIELDS */}
            {selectedRole === 'SELLER' && (
              <>
                <Input
                  label="Business / Shop Name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sri Lakshmi Agri Inputs Store"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Pesticide License Number"
                    type="text"
                    value={pesticideLicenseNo}
                    onChange={(e) => setPesticideLicenseNo(e.target.value)}
                    placeholder="e.g. PEST-TS-2024-88"
                    required
                  />
                  <Input
                    label="Fertilizer License Number (Optional)"
                    type="text"
                    value={fertilizerLicenseNo}
                    onChange={(e) => setFertilizerLicenseNo(e.target.value)}
                    placeholder="e.g. FERT-TS-2024-44"
                  />
                </div>
                <Input
                  label="Shop Address Line"
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Door 4-12, Station Road"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Taluk / Mandal"
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    placeholder="e.g. Hanamkonda"
                  />
                  <Input
                    label="Pincode"
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 506001"
                    required
                  />
                </div>
              </>
            )}

            {/* EXPERT FIELDS */}
            {selectedRole === 'AGRICULTURAL_EXPERT' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Pathology">Plant Pathology</option>
                    <option value="Entomology">Entomology (Insect Pests)</option>
                    <option value="Agronomy">Agronomy & Crop Management</option>
                    <option value="Soil Science">Soil Science & Plant Nutrition</option>
                  </select>
                </div>
                <Input
                  label="Qualification"
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Sc. (Ag) / M.Sc. (Ag Pathology)"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Certification / License No"
                    type="text"
                    value={certificationNo}
                    onChange={(e) => setCertificationNo(e.target.value)}
                    placeholder="e.g. AGRI-CERT-104"
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* DELIVERY PARTNER FIELDS */}
            {selectedRole === 'DELIVERY_PARTNER' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                    >
                      <option value="Bike">Motorcycle / Bike</option>
                      <option value="Auto">Auto Rickshaw / Cargo Auto</option>
                      <option value="Pickup Truck">Pickup Truck (Bolero/Ace)</option>
                    </select>
                  </div>
                  <Input
                    label="Vehicle Registration Number"
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. TS-03-AB-1234"
                    required
                  />
                </div>
                <Input
                  label="Active Service District"
                  type="text"
                  value={activeDistrict}
                  onChange={(e) => setActiveDistrict(e.target.value)}
                  placeholder="e.g. Warangal"
                  required
                />
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              Complete Registration →
            </Button>
          </form>
        </Card>
      )}

      {/* STEP 5: REGISTRATION SUCCESS */}
      {currentStep === 5 && (
        <Card className="p-8 space-y-6 border border-emerald-200 bg-emerald-50/40 text-center shadow-elevated">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Registration Successful!</h2>
            <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto">
              Your account has been created successfully. Redirecting you to your workspace dashboard...
            </p>
          </div>
          <Badge variant="success" size="md" className="mx-auto">
            Role: {selectedRole}
          </Badge>
        </Card>
      )}
    </div>
  );
}
