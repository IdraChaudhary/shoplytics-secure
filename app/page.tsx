'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const { tenant, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && tenant) {
      router.push('/dashboard');
    }
  }, [tenant, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mb-4 inline-block">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, this will redirect via useEffect
  if (tenant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Shoplytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Privacy-First
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shopify Analytics
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-assisted multi-tenant insights platform for enterprise retailers. 
              Get powerful analytics while keeping your data secure and private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-lg font-semibold text-lg transition-all bg-white/50 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Everything you need for Shopify analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for enterprise retailers who need powerful insights without compromising privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-time Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant insights into your store performance with live dashboards, 
                customer behavior tracking, and revenue analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Privacy-First Design
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your data stays secure with enterprise-grade encryption, 
                GDPR compliance, and complete tenant data isolation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Discover hidden patterns and opportunities with machine learning 
                algorithms that analyze your customer and sales data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to unlock your store's potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of retailers who trust Shoplytics for their analytics needs.
          </p>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Shoplytics</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Shoplytics. Privacy-first analytics for enterprise retailers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
