'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Book, 
  Code, 
  Database, 
  Server, 
  Zap, 
  Shield, 
  BarChart,
  Users,
  Settings,
  FileText,
  Video,
  Download,
  ExternalLink
} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [apiSpec, setApiSpec] = useState(null);

  useEffect(() => {
    // Load OpenAPI specification
    fetch('/api/docs/openapi.json')
      .then(res => res.json())
      .then(spec => setApiSpec(spec))
      .catch(err => console.error('Failed to load API spec:', err));
  }, []);

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Book,
      description: 'Introduction to Shoplytics API'
    },
    {
      id: 'quickstart',
      title: 'Quick Start',
      icon: Zap,
      description: 'Get up and running in minutes'
    },
    {
      id: 'authentication',
      title: 'Authentication',
      icon: Shield,
      description: 'API authentication methods'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: Code,
      description: 'Interactive API documentation'
    },
    {
      id: 'architecture',
      title: 'Architecture',
      icon: Server,
      description: 'System architecture overview'
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icon: Video,
      description: 'Step-by-step guides'
    },
    {
      id: 'examples',
      title: 'Examples',
      icon: FileText,
      description: 'Code examples and use cases'
    }
  ];

  const renderOverview = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Shoplytics API Documentation
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Powerful e-commerce analytics and insights platform for Shopify stores
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <BarChart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Real-time sales, customer, and product analytics</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Insights</h3>
            <p className="text-gray-600">Deep customer behavior analysis and segmentation</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <Database className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Integration</h3>
            <p className="text-gray-600">Seamless Shopify data synchronization</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p className="text-blue-100 mb-6">
              Start building with Shoplytics in just a few minutes. Our comprehensive API 
              provides everything you need to integrate powerful analytics into your applications.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveSection('quickstart')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Play className="h-5 w-5 inline mr-2" />
                Quick Start Guide
              </button>
              <button 
                onClick={() => setActiveSection('api-reference')}
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Code className="h-5 w-5 inline mr-2" />
                API Reference
              </button>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <pre className="text-sm text-blue-100 overflow-x-auto">
{`// Initialize Shoplytics client
const shoplytics = new Shoplytics({
  apiKey: 'your-api-key',
  shopDomain: 'your-shop.myshopify.com'
});

// Get revenue analytics
const analytics = await shoplytics.analytics.getRevenue({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});`}
            </pre>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Key Features</h3>
          <ul className="space-y-3">
            {[
              'Real-time dashboard analytics',
              'Customer journey tracking',
              'Product performance insights',
              'Revenue optimization tools',
              'Automated reporting',
              'Custom webhook integrations'
            ].map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Resources</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub Repository
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Download className="h-4 w-4 mr-2" />
              SDK Downloads
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </a>
            <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
              <Users className="h-4 w-4 mr-2" />
              Community Forum
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickStart = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Guide</h1>
        <p className="text-lg text-gray-600 mb-8">
          Get your Shoplytics integration up and running in just a few steps.
        </p>
      </div>

      <div className="space-y-8">
        <div className="border-l-4 border-blue-500 pl-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Step 1: Get Your API Credentials
          </h3>
          <p className="text-gray-700 mb-4">
            First, you'll need to obtain your API credentials from the Shoplytics dashboard.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <code className="text-sm">
              API_KEY: sk_live_xxxxxxxxxxxxxxxxxxxxxxxx<br/>
              SHOP_DOMAIN: your-shop.myshopify.com
            </code>
          </div>
        </div>

        <div className="border-l-4 border-green-500 pl-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Step 2: Install the SDK
          </h3>
          <p className="text-gray-700 mb-4">
            Install the Shoplytics SDK for your preferred programming language.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-white text-sm mb-2">Node.js</p>
              <code className="text-green-400 text-sm">npm install @shoplytics/sdk</code>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-white text-sm mb-2">Python</p>
              <code className="text-green-400 text-sm">pip install shoplytics-python</code>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-purple-500 pl-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Step 3: Initialize the Client
          </h3>
          <p className="text-gray-700 mb-4">
            Set up your Shoplytics client with your credentials.
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`import { Shoplytics } from '@shoplytics/sdk';

const client = new Shoplytics({
  apiKey: process.env.SHOPLYTICS_API_KEY,
  shopDomain: process.env.SHOP_DOMAIN,
  environment: 'production' // or 'sandbox'
});

// Test the connection
const health = await client.health.check();
console.log('Connection status:', health.status);`}
            </pre>
          </div>
        </div>

        <div className="border-l-4 border-orange-500 pl-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Step 4: Make Your First API Call
          </h3>
          <p className="text-gray-700 mb-4">
            Try fetching some basic analytics data.
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`// Get revenue data for the last 30 days
const analytics = await client.analytics.getRevenue({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  groupBy: 'day'
});

console.log('Revenue data:', analytics);

// Get top products
const products = await client.products.getTopPerforming({
  metric: 'revenue',
  limit: 10
});

console.log('Top products:', products);`}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h4>
        <ul className="text-blue-800 space-y-2">
          <li>• Explore the interactive API reference</li>
          <li>• Set up webhook endpoints for real-time updates</li>
          <li>• Check out our sample applications</li>
          <li>• Join our developer community</li>
        </ul>
      </div>
    </div>
  );

  const renderApiReference = () => (
    <div className="max-w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Reference</h1>
        <p className="text-gray-600">
          Interactive documentation with live testing capabilities
        </p>
      </div>
      
      {apiSpec ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <SwaggerUI 
            spec={apiSpec} 
            tryItOutEnabled={true}
            persistAuthorization={true}
            theme={{
              palette: {
                primary: {
                  main: '#2563eb'
                }
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'quickstart':
        return renderQuickStart();
      case 'api-reference':
        return renderApiReference();
      default:
        return (
          <div className="max-w-4xl mx-auto text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            <p className="text-gray-600 mb-8">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
            <div className="bg-gray-50 rounded-lg p-12">
              <p className="text-gray-500">Content coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Shoplytics Docs</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
              <a 
                href="https://github.com/shoplytics/docs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
