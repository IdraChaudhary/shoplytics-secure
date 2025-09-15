'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  shopDomain?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    // Simple mock authentication
    if (email === 'demo@shoplytics.com' && password === 'demo123456') {
      const mockTenant: Tenant = {
        id: '1',
        name: 'Demo Store',
        email: 'demo@shoplytics.com',
        shopDomain: 'demo-store.myshopify.com',
        hasShopifyIntegration: true
      };
      
      setTenant(mockTenant);
      setLoading(false);
      router.push('/dashboard');
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: 'Invalid credentials. Use demo@shoplytics.com / demo123456' };
  };

  const register = async (registerData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    // Simple mock registration
    const mockTenant: Tenant = {
      id: '2',
      name: registerData.name,
      email: registerData.email,
      shopDomain: registerData.shopDomain,
      hasShopifyIntegration: false
    };
    
    setTenant(mockTenant);
    setLoading(false);
    router.push('/dashboard');
    return { success: true };
  };

  const logout = () => {
    setTenant(null);
    router.push('/');
  };

  const value: AuthContextType = {
    tenant,
    loading,
    login,
    register,
    logout,
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
