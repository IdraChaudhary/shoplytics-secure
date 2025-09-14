'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker,
  TrendingUp,
  Users,
  Eye,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Play,
  Pause,
  StopCircle,
  Settings,
  Filter,
  Calendar,
  Download,
  Share2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Zap,
  Brain,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  type: 'feature' | 'ui' | 'content' | 'flow';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  duration: number; // in days
  targetMetric: string;
  confidenceLevel: number;
  minimumDetectableEffect: number;
  variants: ABVariant[];
  results?: ABTestResults;
  tags: string[];
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficAllocation: number; // percentage
  configuration: any;
  metrics?: VariantMetrics;
}

interface VariantMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  bounceRate: number;
  timeOnPage: number;
}

interface ABTestResults {
  winner: string | null;
  confidence: number;
  statisticalSignificance: boolean;
  uplift: number;
  pValue: number;
  sampleSize: number;
  duration: number;
  insights: string[];
}

interface ABTestInsight {
  id: string;
  type: 'performance' | 'significance' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

const SAMPLE_TESTS: ABTest[] = [
  {
    id: 'checkout-optimization',
    name: 'Checkout Flow Optimization',
    description: 'Testing streamlined single-page checkout vs. multi-step process',
    status: 'running',
    type: 'flow',
    createdAt: '2024-01-10T10:00:00Z',
    startedAt: '2024-01-15T10:00:00Z',
    duration: 14,
    targetMetric: 'conversion_rate',
    confidenceLevel: 95,
    minimumDetectableEffect: 5,
    variants: [
      {
        id: 'control',
        name: 'Multi-step Checkout',
        description: 'Current multi-step checkout process',
        isControl: true,
        trafficAllocation: 50,
        configuration: { steps: 3, layout: 'multi-page' },
        metrics: {
          visitors: 2847,
          conversions: 456,
          conversionRate: 16.02,
          revenue: 45620,
          averageOrderValue: 100.04,
          bounceRate: 24.5,
          timeOnPage: 180
        }
      },
      {
        id: 'variant-a',
        name: 'Single-page Checkout',
        description: 'Streamlined single-page checkout experience',
        isControl: false,
        trafficAllocation: 50,
        configuration: { steps: 1, layout: 'single-page' },
        metrics: {
          visitors: 2834,
          conversions: 512,
          conversionRate: 18.07,
          revenue: 52840,
          averageOrderValue: 103.20,
          bounceRate: 19.8,
          timeOnPage: 165
        }
      }
    ],
    results: {
      winner: 'variant-a',
      confidence: 94.2,
      statisticalSignificance: true,
      uplift: 12.8,
      pValue: 0.031,
      sampleSize: 5681,
      duration: 9,
      insights: [
        'Single-page checkout shows 12.8% improvement in conversion rate',
        'Average order value increased by 3.16%',
        'Bounce rate reduced by 19.2%',
        'Time on page decreased by 8.3%, indicating smoother flow'
      ]
    },
    tags: ['checkout', 'conversion', 'ux']
  },
  {
    id: 'dashboard-layout',
    name: 'Dashboard Layout Test',
    description: 'Comparing grid vs. list layout for analytics dashboard',
    status: 'completed',
    type: 'ui',
    createdAt: '2024-01-05T10:00:00Z',
    startedAt: '2024-01-08T10:00:00Z',
    endedAt: '2024-01-22T10:00:00Z',
    duration: 14,
    targetMetric: 'engagement_rate',
    confidenceLevel: 95,
    minimumDetectableEffect: 8,
    variants: [
      {
        id: 'control',
        name: 'Grid Layout',
        description: 'Current card-based grid layout',
        isControl: true,
        trafficAllocation: 50,
        configuration: { layout: 'grid', cardsPerRow: 4 },
        metrics: {
          visitors: 1523,
          conversions: 987,
          conversionRate: 64.8,
          revenue: 0,
          averageOrderValue: 0,
          bounceRate: 28.4,
          timeOnPage: 245
        }
      },
      {
        id: 'variant-b',
        name: 'List Layout',
        description: 'Linear list-based dashboard layout',
        isControl: false,
        trafficAllocation: 50,
        configuration: { layout: 'list', density: 'compact' },
        metrics: {
          visitors: 1518,
          conversions: 1123,
          conversionRate: 73.9,
          revenue: 0,
          averageOrderValue: 0,
          bounceRate: 22.1,
          timeOnPage: 298
        }
      }
    ],
    results: {
      winner: 'variant-b',
      confidence: 98.5,
      statisticalSignificance: true,
      uplift: 14.1,
      pValue: 0.008,
      sampleSize: 3041,
      duration: 14,
      insights: [
        'List layout shows 14.1% improvement in engagement rate',
        'Users spend 21.6% more time exploring data',
        'Bounce rate reduced by 22.2%',
        'Better performance on mobile devices'
      ]
    },
    tags: ['dashboard', 'layout', 'engagement']
  },
  {
    id: 'onboarding-flow',
    name: 'User Onboarding Experience',
    description: 'Testing guided tour vs. interactive tutorial for new users',
    status: 'draft',
    type: 'feature',
    createdAt: '2024-01-20T10:00:00Z',
    duration: 21,
    targetMetric: 'activation_rate',
    confidenceLevel: 95,
    minimumDetectableEffect: 10,
    variants: [
      {
        id: 'control',
        name: 'Guided Tour',
        description: 'Step-by-step guided tour overlay',
        isControl: true,
        trafficAllocation: 33,
        configuration: { type: 'overlay', steps: 8, skippable: true }
      },
      {
        id: 'variant-a',
        name: 'Interactive Tutorial',
        description: 'Hands-on interactive tutorial with sample data',
        isControl: false,
        trafficAllocation: 33,
        configuration: { type: 'interactive', sampleData: true, progress: true }
      },
      {
        id: 'variant-b',
        name: 'Video Introduction',
        description: 'Short video introduction with key features',
        isControl: false,
        trafficAllocation: 34,
        configuration: { type: 'video', duration: 90, autoplay: false }
      }
    ],
    tags: ['onboarding', 'activation', 'tutorial']
  }
];

const SAMPLE_INSIGHTS: ABTestInsight[] = [
  {
    id: '1',
    type: 'performance',
    title: 'Strong Performance Detected',
    description: 'Single-page checkout is outperforming the control by 12.8% with statistical significance',
    impact: 'high'
  },
  {
    id: '2',
    type: 'significance',
    title: 'Test Reaching Significance',
    description: 'Checkout optimization test has achieved 94.2% confidence level',
    impact: 'high'
  },
  {
    id: '3',
    type: 'recommendation',
    title: 'Consider Early Stop',
    description: 'Dashboard layout test shows consistent winner - consider stopping early',
    impact: 'medium'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Low Sample Size',
    description: 'Onboarding test needs more traffic to reach statistical significance',
    impact: 'medium'
  }
];

export default function ABTestingPage() {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'insights' | 'settings'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTests = SAMPLE_TESTS.filter(test => {
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    const matchesType = filterType === 'all' || test.type === filterType;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'significance': return <Target className="h-5 w-5 text-blue-600" />;
      case 'recommendation': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Eye className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateUplift = (control: VariantMetrics, variant: VariantMetrics) => {
    const controlRate = control.conversionRate;
    const variantRate = variant.conversionRate;
    return ((variantRate - controlRate) / controlRate) * 100;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Beaker className="h-8 w-8 mr-3 text-purple-600" />
                A/B Testing Framework
              </h1>
              <p className="mt-2 text-gray-600">Optimize features and user experience through data-driven experimentation</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Beaker className="h-4 w-4 mr-2" />
                New Test
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tests', label: 'Tests', icon: Beaker },
              { id: 'insights', label: 'Insights', icon: Brain },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Beaker className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_TESTS.length}
                    </div>
                    <div className="text-sm text-gray-500">Total Tests</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_TESTS.filter(t => t.status === 'running').length}
                    </div>
                    <div className="text-sm text-gray-500">Running</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_TESTS.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      +{SAMPLE_TESTS.filter(t => t.results?.winner && !t.results.winner.includes('control')).length * 8.5}%
                    </div>
                    <div className="text-sm text-gray-500">Avg Uplift</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Insights</h2>
              <div className="space-y-4">
                {SAMPLE_INSIGHTS.map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Tests Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Tests</h2>
              <div className="space-y-4">
                {SAMPLE_TESTS.filter(test => test.status === 'running').map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status}</span>
                        </span>
                      </div>
                      {test.results && (
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            +{test.results.uplift.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {test.results.confidence.toFixed(1)}% confidence
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {test.variants.filter(v => v.metrics).length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {test.variants.filter(v => v.metrics).map((variant) => (
                          <div key={variant.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{variant.name}</span>
                              {variant.isControl && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                  Control
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              {variant.metrics!.conversionRate.toFixed(2)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatNumber(variant.metrics!.visitors)} visitors
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="feature">Feature</option>
                    <option value="ui">UI/UX</option>
                    <option value="content">Content</option>
                    <option value="flow">User Flow</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Tests List */}
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {getStatusIcon(test.status)}
                          <span className="ml-1">{test.status}</span>
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                          {test.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{test.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(test.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {test.variants.length} variants
                        </span>
                        <span className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {test.targetMetric.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    {test.results && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          test.results.uplift > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {test.results.uplift > 0 ? '+' : ''}{test.results.uplift.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {test.results.confidence.toFixed(1)}% confidence
                        </div>
                        {test.results.statisticalSignificance && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Significant
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress bar for running tests */}
                  {test.status === 'running' && test.startedAt && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.min(100, Math.round(
                            (Date.now() - new Date(test.startedAt).getTime()) / 
                            (test.duration * 24 * 60 * 60 * 1000) * 100
                          ))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round(
                              (Date.now() - new Date(test.startedAt).getTime()) / 
                              (test.duration * 24 * 60 * 60 * 1000) * 100
                            ))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SAMPLE_INSIGHTS.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {insight.impact}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Performance Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Performance Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {SAMPLE_TESTS.filter(test => test.results).map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      <span className={`text-lg font-bold ${
                        test.results!.uplift > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {test.results!.uplift > 0 ? '+' : ''}{test.results!.uplift.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Confidence Level</span>
                        <span className="font-medium">{test.results!.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sample Size</span>
                        <span className="font-medium">{formatNumber(test.results!.sampleSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">P-Value</span>
                        <span className="font-medium">{test.results!.pValue.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Statistical Significance</span>
                        <span className={`font-medium ${
                          test.results!.statisticalSignificance ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {test.results!.statisticalSignificance ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {test.results!.insights.slice(0, 2).map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Confidence Level
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="90">90%</option>
                    <option value="95" selected>95%</option>
                    <option value="99">99%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Detectable Effect
                  </label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Test Duration
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="7">1 week</option>
                    <option value="14" selected>2 weeks</option>
                    <option value="21">3 weeks</option>
                    <option value="30">1 month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Stop Tests
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="never">Never</option>
                    <option value="significance">When significant</option>
                    <option value="duration">After duration</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Test Completion</h4>
                      <p className="text-sm text-gray-500">Notify when tests reach completion</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Statistical Significance</h4>
                      <p className="text-sm text-gray-500">Notify when tests reach significance</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Performance Alerts</h4>
                      <p className="text-sm text-gray-500">Notify about significant performance changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTest.name}</h2>
                    <p className="text-gray-600">{selectedTest.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Variants Comparison */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Performance</h3>
                    <div className="space-y-4">
                      {selectedTest.variants.filter(v => v.metrics).map((variant) => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{variant.name}</h4>
                              {variant.isControl && (
                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                  Control
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {variant.trafficAllocation}% traffic
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Visitors</div>
                              <div className="font-semibold">{formatNumber(variant.metrics!.visitors)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Conversions</div>
                              <div className="font-semibold">{formatNumber(variant.metrics!.conversions)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Conversion Rate</div>
                              <div className="font-semibold text-purple-600">
                                {variant.metrics!.conversionRate.toFixed(2)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">Revenue</div>
                              <div className="font-semibold">${formatNumber(variant.metrics!.revenue)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Analysis</h3>
                    {selectedTest.results ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${
                              selectedTest.results.uplift > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {selectedTest.results.uplift > 0 ? '+' : ''}{selectedTest.results.uplift.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500">Performance Change</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold">{selectedTest.results.confidence.toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">Confidence</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-semibold">{selectedTest.results.pValue.toFixed(3)}</div>
                            <div className="text-sm text-gray-500">P-Value</div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                          <ul className="space-y-2">
                            {selectedTest.results.insights.map((insight, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Results will appear once the test has sufficient data</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
