'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Eye, EyeOff, Store, Key, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, tenant } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shopDomain: '',
    shopifyAccessToken: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingShopify, setValidatingShopify] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (tenant) {
      router.push('/dashboard');
    }
  }, [tenant, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.shopDomain && !formData.shopifyAccessToken) {
      newErrors.shopifyAccessToken = 'Access token is required when shop domain is provided';
    }

    if (formData.shopifyAccessToken && !formData.shopDomain) {
      newErrors.shopDomain = 'Shop domain is required when access token is provided';
    }

    if (formData.shopDomain && !formData.shopDomain.includes('.myshopify.com')) {
      newErrors.shopDomain = 'Please enter a valid Shopify domain (e.g., your-store.myshopify.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (!result.success) {
      setErrors({ submit: result.error || 'Registration failed' });
    }
    
    setLoading(false);
  };

  const handleSkipShopify = () => {
    setFormData(prev => ({
      ...prev,
      shopDomain: '',
      shopifyAccessToken: ''
    }));
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get started with Shoplytics analytics
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Account</span>
          </div>
          <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Shopify</span>
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border" onSubmit={handleSubmit}>
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <p className="text-sm text-gray-600">Tell us about your business</p>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your company name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full px-3 py-3 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Create a password (min. 8 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`block w-full px-3 py-3 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Shopify Integration */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Store className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Connect Your Shopify Store</h3>
                <p className="text-sm text-gray-600">Optional: Connect now or set up later in settings</p>
              </div>

              {/* Shop Domain */}
              <div>
                <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-1">
                  Shopify Store Domain
                </label>
                <input
                  id="shopDomain"
                  name="shopDomain"
                  type="text"
                  className={`block w-full px-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.shopDomain ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="your-store.myshopify.com"
                  value={formData.shopDomain}
                  onChange={handleInputChange}
                />
                {errors.shopDomain && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopDomain}</p>
                )}
              </div>

              {/* Access Token */}
              <div>
                <label htmlFor="shopifyAccessToken" className="block text-sm font-medium text-gray-700 mb-1">
                  Shopify Access Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="shopifyAccessToken"
                    name="shopifyAccessToken"
                    type="password"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.shopifyAccessToken ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="shpat_..."
                    value={formData.shopifyAccessToken}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.shopifyAccessToken && (
                  <p className="mt-1 text-sm text-red-600">{errors.shopifyAccessToken}</p>
                )}
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Need help?</strong> You can create a private app in your Shopify admin to get an access token.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Don't worry - you can skip this step and set it up later in your dashboard settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Skip Option */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSkipShopify}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Skip for now - I'll connect my store later
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : currentStep === 1 ? (
                'Continue'
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
