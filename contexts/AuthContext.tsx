'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  shopDomain?: string;
  hasShopifyIntegration: boolean;
}

interface AuthContextType {
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  shopDomain?: string;
  shopifyAccessToken?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTenant(data.tenant);
      } else {
        setTenant(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setTenant(data.tenant);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (registerData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        setTenant(data.tenant);
        router.push('/dashboard');
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed',
          details: data.details
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setTenant(null);
      router.push('/login');
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        await checkAuthStatus();
      } else {
        setTenant(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setTenant(null);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    tenant,
    loading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected components
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { tenant, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !tenant) {
        router.push('/login');
      }
    }, [tenant, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!tenant) {
      return null;
    }

    return <Component {...props} />;
  };
}
