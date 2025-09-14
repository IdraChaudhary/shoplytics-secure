'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireShopify?: boolean;
}

export default function ProtectedRoute({ children, requireShopify = false }: ProtectedRouteProps) {
  const { tenant, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!tenant) {
        router.push('/login');
        return;
      }

      if (requireShopify && !tenant.hasShopifyIntegration) {
        router.push('/settings');
        return;
      }
    }
  }, [tenant, loading, requireShopify, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Not authenticated
  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Require Shopify integration
  if (requireShopify && !tenant.hasShopifyIntegration) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shopify Integration Required</h2>
        <p className="text-gray-600 mb-4 text-center max-w-md">
          This feature requires a connected Shopify store. Please connect your store in settings to continue.
        </p>
        <button
          onClick={() => router.push('/settings')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Connect Shopify Store
        </button>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
