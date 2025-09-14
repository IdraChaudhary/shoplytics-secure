'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  User, 
  Store, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Copy,
  LogOut
} from 'lucide-react';

interface Settings {
  id: string;
  name: string;
  email: string;
  shopDomain?: string;
  hasShopifyIntegration: boolean;
  apiKey: string;
}

export default function SettingsPage() {
  const { tenant, logout } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shopDomain: '',
    shopifyAccessToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/tenant/settings', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setFormData({
          name: data.settings.name,
          shopDomain: data.settings.shopDomain || '',
          shopifyAccessToken: '',
        });
      } else {
        setErrors({ general: 'Failed to load settings' });
      }
    } catch (error) {
      setErrors({ general: 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setSuccessMessage('Settings updated successfully!');
        setFormData(prev => ({
          ...prev,
          shopifyAccessToken: '', // Clear the access token field after saving
        }));
      } else {
        setErrors({ general: data.error || 'Failed to update settings' });
      }
    } catch (error) {
      setErrors({ general: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate the current key and may break existing integrations.')) {
      return;
    }

    setRegeneratingKey(true);
    setErrors({});

    try {
      const response = await fetch('/api/tenant/regenerate-api-key', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(prev => prev ? { ...prev, apiKey: data.apiKey } : null);
        setSuccessMessage('API key regenerated successfully!');
      } else {
        setErrors({ general: data.error || 'Failed to regenerate API key' });
      }
    } catch (error) {
      setErrors({ general: 'Network error occurred' });
    } finally {
      setRegeneratingKey(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('Copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDisconnectShopify = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store? This will stop data synchronization.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          shopDomain: '',
          shopifyAccessToken: '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        setFormData(prev => ({
          ...prev,
          shopDomain: '',
          shopifyAccessToken: '',
        }));
        setSuccessMessage('Shopify store disconnected successfully!');
      } else {
        setErrors({ general: data.error || 'Failed to disconnect Shopify store' });
      }
    } catch (error) {
      setErrors({ general: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{tenant?.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="ml-3 text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="ml-3 text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </h2>
              </div>
              <form onSubmit={handleSaveSettings} className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      value={settings?.email || ''}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Shopify Integration */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Store className="h-5 w-5 mr-2" />
                    Shopify Integration
                    {settings?.hasShopifyIntegration && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connected
                      </span>
                    )}
                  </h2>
                  {settings?.hasShopifyIntegration && (
                    <button
                      type="button"
                      onClick={handleDisconnectShopify}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Disconnect Store
                    </button>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-1">
                    Shopify Store Domain
                  </label>
                  <input
                    id="shopDomain"
                    name="shopDomain"
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-store.myshopify.com"
                    value={formData.shopDomain}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="shopifyAccessToken" className="block text-sm font-medium text-gray-700 mb-1">
                    Shopify Access Token
                  </label>
                  <div className="relative">
                    <input
                      id="shopifyAccessToken"
                      name="shopifyAccessToken"
                      type={showAccessToken ? 'text' : 'password'}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={settings?.hasShopifyIntegration ? "Enter new token to update" : "shpat_..."}
                      value={formData.shopifyAccessToken}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                    >
                      {showAccessToken ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Create a private app in your Shopify admin to get an access token.
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Management */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Key Management
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        disabled
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 font-mono text-sm"
                        value={settings?.apiKey || ''}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.apiKey || '')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateApiKey}
                      disabled={regeneratingKey}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${regeneratingKey ? 'animate-spin' : ''}`} />
                      {regeneratingKey ? 'Generating...' : 'Regenerate'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use this API key to authenticate requests to your analytics endpoints.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
