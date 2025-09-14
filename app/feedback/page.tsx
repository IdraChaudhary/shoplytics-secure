'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Eye,
  Heart,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Settings,
  Tag,
  Calendar,
  Mail,
  Phone,
  Globe,
  Zap,
  Brain,
  Target,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feedback {
  id: string;
  customerName: string;
  customerEmail: string;
  source: 'email' | 'chat' | 'survey' | 'review' | 'social' | 'phone';
  type: 'complaint' | 'suggestion' | 'compliment' | 'question' | 'bug_report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  rating?: number; // 1-5 stars
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  emotions: string[];
  keywords: string[];
  category: string;
  subcategory?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  responseTime?: number; // in hours
  resolution?: string;
  tags: string[];
  customerData?: {
    ordersCount: number;
    totalSpent: number;
    joinDate: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  responseTime: {
    average: number;
    median: number;
    target: number;
  };
  resolutionRate: number;
  customerSatisfaction: number;
  trendingTopics: Array<{
    topic: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    change: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageRating: number;
  }>;
}

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  confidence: number;
  dataPoints: number;
}

const SAMPLE_FEEDBACK: Feedback[] = [
  {
    id: 'fb-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@email.com',
    source: 'email',
    type: 'complaint',
    priority: 'high',
    status: 'in_progress',
    rating: 2,
    title: 'Dashboard loading time issues',
    content: 'The analytics dashboard takes forever to load. I\'ve been waiting over 30 seconds for my data to appear. This is really impacting my workflow and productivity.',
    sentiment: 'negative',
    sentimentScore: -0.7,
    emotions: ['frustrated', 'disappointed'],
    keywords: ['dashboard', 'loading', 'slow', 'productivity', 'workflow'],
    category: 'Performance',
    subcategory: 'Loading Speed',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    assignedTo: 'Mike Chen',
    responseTime: 1.25,
    tags: ['performance', 'dashboard', 'urgent'],
    customerData: {
      ordersCount: 45,
      totalSpent: 12340,
      joinDate: '2023-03-15T00:00:00Z',
      tier: 'gold'
    }
  },
  {
    id: 'fb-002',
    customerName: 'David Rodriguez',
    customerEmail: 'david@company.com',
    source: 'chat',
    type: 'suggestion',
    priority: 'medium',
    status: 'new',
    rating: 4,
    title: 'Add export feature for customer segments',
    content: 'I love the customer segmentation feature! It would be amazing if we could export these segments as CSV files for use in our email marketing campaigns. This would save us hours of manual work.',
    sentiment: 'positive',
    sentimentScore: 0.8,
    emotions: ['excited', 'hopeful'],
    keywords: ['export', 'customer segments', 'CSV', 'email marketing', 'feature request'],
    category: 'Feature Request',
    subcategory: 'Data Export',
    createdAt: '2024-01-19T14:22:00Z',
    updatedAt: '2024-01-19T14:22:00Z',
    tags: ['feature', 'export', 'segmentation'],
    customerData: {
      ordersCount: 128,
      totalSpent: 34560,
      joinDate: '2022-08-12T00:00:00Z',
      tier: 'platinum'
    }
  },
  {
    id: 'fb-003',
    customerName: 'Emily Watson',
    customerEmail: 'emily@startup.io',
    source: 'survey',
    type: 'compliment',
    priority: 'low',
    status: 'resolved',
    rating: 5,
    title: 'Amazing customer insights!',
    content: 'The AI-powered customer insights have transformed how we understand our audience. The predictive analytics helped us increase our conversion rate by 23%. Absolutely phenomenal tool!',
    sentiment: 'positive',
    sentimentScore: 0.95,
    emotions: ['amazed', 'satisfied', 'grateful'],
    keywords: ['AI insights', 'customer insights', 'predictive analytics', 'conversion rate', 'transformation'],
    category: 'Product Praise',
    subcategory: 'AI Features',
    createdAt: '2024-01-18T11:45:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    responseTime: 0.25,
    resolution: 'Thanked customer and shared feedback with product team',
    tags: ['positive', 'ai', 'insights', 'conversion'],
    customerData: {
      ordersCount: 23,
      totalSpent: 5670,
      joinDate: '2023-11-20T00:00:00Z',
      tier: 'silver'
    }
  },
  {
    id: 'fb-004',
    customerName: 'John Martinez',
    customerEmail: 'john@ecommerce.com',
    source: 'review',
    type: 'bug_report',
    priority: 'urgent',
    status: 'new',
    rating: 1,
    title: 'Data sync not working',
    content: 'My Shopify data hasn\'t synced in 3 days. I can\'t see any recent orders or customer data. This is a critical issue affecting our business operations. Please fix ASAP!',
    sentiment: 'negative',
    sentimentScore: -0.9,
    emotions: ['angry', 'frustrated', 'concerned'],
    keywords: ['data sync', 'Shopify', 'orders', 'customer data', 'critical', 'business operations'],
    category: 'Technical Issue',
    subcategory: 'Data Synchronization',
    createdAt: '2024-01-20T16:30:00Z',
    updatedAt: '2024-01-20T16:30:00Z',
    tags: ['urgent', 'bug', 'data-sync', 'shopify'],
    customerData: {
      ordersCount: 89,
      totalSpent: 22100,
      joinDate: '2022-12-05T00:00:00Z',
      tier: 'gold'
    }
  },
  {
    id: 'fb-005',
    customerName: 'Lisa Park',
    customerEmail: 'lisa@boutique.com',
    source: 'phone',
    type: 'question',
    priority: 'medium',
    status: 'resolved',
    rating: 4,
    title: 'How to set up automated reports?',
    content: 'I need help setting up automated weekly reports for my team. The documentation isn\'t very clear on this. Could someone walk me through the process?',
    sentiment: 'neutral',
    sentimentScore: 0.1,
    emotions: ['curious', 'confused'],
    keywords: ['automated reports', 'weekly reports', 'documentation', 'setup', 'help'],
    category: 'Support',
    subcategory: 'How-to',
    createdAt: '2024-01-17T13:20:00Z',
    updatedAt: '2024-01-17T15:45:00Z',
    responseTime: 2.4,
    resolution: 'Provided step-by-step guide and scheduled demo call',
    tags: ['support', 'reports', 'documentation', 'training'],
    customerData: {
      ordersCount: 12,
      totalSpent: 2890,
      joinDate: '2023-12-10T00:00:00Z',
      tier: 'bronze'
    }
  }
];

const SAMPLE_ANALYTICS: FeedbackAnalytics = {
  totalFeedback: 234,
  averageRating: 3.8,
  sentimentDistribution: {
    positive: 45,
    neutral: 32,
    negative: 23
  },
  responseTime: {
    average: 2.4,
    median: 1.8,
    target: 2.0
  },
  resolutionRate: 87,
  customerSatisfaction: 82,
  trendingTopics: [
    { topic: 'Dashboard Performance', count: 23, sentiment: 'negative', change: 15 },
    { topic: 'AI Features', count: 18, sentiment: 'positive', change: 8 },
    { topic: 'Data Export', count: 12, sentiment: 'neutral', change: -3 },
    { topic: 'Mobile App', count: 9, sentiment: 'positive', change: 12 },
  ],
  categoryBreakdown: [
    { category: 'Technical Issue', count: 67, averageRating: 2.1 },
    { category: 'Feature Request', count: 54, averageRating: 4.2 },
    { category: 'Support', count: 43, averageRating: 3.9 },
    { category: 'Product Praise', count: 38, averageRating: 4.7 },
    { category: 'Performance', count: 32, averageRating: 2.8 },
  ]
};

const AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ai-001',
    type: 'risk',
    title: 'Dashboard Performance Complaints Increasing',
    description: 'Negative feedback about dashboard loading times has increased by 45% in the past week, primarily from gold and platinum tier customers.',
    impact: 'high',
    actionItems: [
      'Investigate dashboard performance bottlenecks',
      'Prioritize performance optimization sprint',
      'Proactively communicate with affected high-value customers'
    ],
    confidence: 0.94,
    dataPoints: 23
  },
  {
    id: 'ai-002',
    type: 'opportunity',
    title: 'High Demand for Data Export Features',
    description: 'Multiple customers requesting CSV export functionality for customer segments. This could be a competitive differentiator.',
    impact: 'medium',
    actionItems: [
      'Add CSV export to product roadmap',
      'Survey customers for specific export requirements',
      'Consider premium feature pricing strategy'
    ],
    confidence: 0.87,
    dataPoints: 18
  },
  {
    id: 'ai-003',
    type: 'trend',
    title: 'AI Features Driving Customer Satisfaction',
    description: 'Customers mentioning AI features have 23% higher satisfaction scores and are more likely to recommend the product.',
    impact: 'high',
    actionItems: [
      'Highlight AI capabilities in marketing materials',
      'Create case studies from positive AI feedback',
      'Expand AI feature set based on customer requests'
    ],
    confidence: 0.91,
    dataPoints: 31
  },
  {
    id: 'ai-004',
    type: 'anomaly',
    title: 'Unusual Spike in Data Sync Issues',
    description: 'Data synchronization issues have increased 3x in the past 48 hours, suggesting a potential system-wide problem.',
    impact: 'high',
    actionItems: [
      'Immediately investigate data sync infrastructure',
      'Set up monitoring alerts for sync failures',
      'Prepare customer communication about ongoing issues'
    ],
    confidence: 0.96,
    dataPoints: 12
  }
];

export default function FeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'analytics' | 'insights'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedback = SAMPLE_FEEDBACK.filter(feedback => {
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    const matchesSource = filterSource === 'all' || feedback.source === filterSource;
    const matchesSentiment = filterSentiment === 'all' || feedback.sentiment === filterSentiment;
    const matchesSearch = feedback.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSource && matchesSentiment && matchesSearch;
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'survey': return <BarChart3 className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      case 'social': return <Globe className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4" />;
      case 'negative': return <ThumbsDown className="h-4 w-4" />;
      case 'neutral': return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'anomaly': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'risk': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default: return <Brain className="h-5 w-5 text-purple-600" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
                Customer Feedback Hub
              </h1>
              <p className="mt-2 text-gray-600">Collect, analyze, and act on customer feedback with AI-powered insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Report
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
              { id: 'feedback', label: 'Feedback', icon: MessageSquare },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
              { id: 'insights', label: 'AI Insights', icon: Brain }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(SAMPLE_ANALYTICS.totalFeedback)}
                    </div>
                    <div className="text-sm text-gray-500">Total Feedback</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_ANALYTICS.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">Avg Rating</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_ANALYTICS.responseTime.average.toFixed(1)}h
                    </div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {SAMPLE_ANALYTICS.resolutionRate}%
                    </div>
                    <div className="text-sm text-gray-500">Resolution Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sentiment Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center">
                      <ThumbsUp className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{SAMPLE_ANALYTICS.sentimentDistribution.positive}%</div>
                  <div className="text-sm text-gray-500">Positive</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{SAMPLE_ANALYTICS.sentimentDistribution.neutral}%</div>
                  <div className="text-sm text-gray-500">Neutral</div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                      <ThumbsDown className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{SAMPLE_ANALYTICS.sentimentDistribution.negative}%</div>
                  <div className="text-sm text-gray-500">Negative</div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trending Topics</h2>
              <div className="space-y-4">
                {SAMPLE_ANALYTICS.trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getSentimentColor(topic.sentiment)}`}>
                        {getSentimentIcon(topic.sentiment)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{topic.topic}</h3>
                        <p className="text-sm text-gray-500">{topic.count} mentions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center text-sm font-medium ${
                        topic.change > 0 ? 'text-red-600' : topic.change < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {topic.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : topic.change < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                        {topic.change > 0 ? '+' : ''}{topic.change}%
                      </div>
                      <div className="text-sm text-gray-500">vs last week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent AI Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent AI Insights</h2>
              <div className="space-y-4">
                {AI_INSIGHTS.slice(0, 2).map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{(insight.confidence * 100).toFixed(0)}% confidence</span>
                          <span className="mx-2">•</span>
                          <span>{insight.dataPoints} data points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sources</option>
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="phone">Phone</option>
                  <option value="survey">Survey</option>
                  <option value="review">Review</option>
                  <option value="social">Social</option>
                </select>

                <select
                  value={filterSentiment}
                  onChange={(e) => setFilterSentiment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sentiment</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedFeedback(feedback)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                          {feedback.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{feedback.content}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {feedback.customerName}
                        </span>
                        <span className="flex items-center">
                          {getSourceIcon(feedback.source)}
                          <span className="ml-1 capitalize">{feedback.source}</span>
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {feedback.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {feedback.rating && (
                        <div className="flex items-center">
                          {renderStarRating(feedback.rating)}
                          <span className="ml-2 text-sm text-gray-600">{feedback.rating}.0</span>
                        </div>
                      )}
                      
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                        {getSentimentIcon(feedback.sentiment)}
                        <span className="ml-1 capitalize">{feedback.sentiment}</span>
                      </div>

                      {feedback.customerData && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.customerData.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                          feedback.customerData.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                          feedback.customerData.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {feedback.customerData.tier} customer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Keywords/Tags */}
                  <div className="flex flex-wrap gap-2">
                    {feedback.keywords.slice(0, 5).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Feedback by Category</h2>
              <div className="space-y-4">
                {SAMPLE_ANALYTICS.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{category.category}</h3>
                      <p className="text-sm text-gray-500">{category.count} feedback items</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {renderStarRating(Math.round(category.averageRating))}
                        <span className="ml-2 font-medium">{category.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-500">Average rating</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Response Time Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{SAMPLE_ANALYTICS.responseTime.average.toFixed(1)}h</div>
                  <div className="text-sm text-gray-500">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{SAMPLE_ANALYTICS.responseTime.median.toFixed(1)}h</div>
                  <div className="text-sm text-gray-500">Median Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{SAMPLE_ANALYTICS.responseTime.target.toFixed(1)}h</div>
                  <div className="text-sm text-gray-500">Target Response Time</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Performance vs Target</span>
                  <span>{((SAMPLE_ANALYTICS.responseTime.target / SAMPLE_ANALYTICS.responseTime.average) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${Math.min(100, (SAMPLE_ANALYTICS.responseTime.target / SAMPLE_ANALYTICS.responseTime.average) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Satisfaction Score</h2>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      strokeDasharray={`${(SAMPLE_ANALYTICS.customerSatisfaction / 100) * 282.74} 282.74`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{SAMPLE_ANALYTICS.customerSatisfaction}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Based on customer ratings and sentiment analysis</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Insights</h2>
              <div className="space-y-6">
                {AI_INSIGHTS.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{insight.description}</p>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                          <ul className="space-y-1">
                            {insight.actionItems.map((action, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                          <span>Based on {insight.dataPoints} data points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      <AnimatePresence>
        {selectedFeedback && (
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
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedFeedback.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {selectedFeedback.customerName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedFeedback.createdAt).toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        {getSourceIcon(selectedFeedback.source)}
                        <span className="ml-1 capitalize">{selectedFeedback.source}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback Content</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{selectedFeedback.content}</p>
                      </div>
                    </div>

                    {selectedFeedback.keywords.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFeedback.keywords.map((keyword, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedFeedback.emotions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Detected Emotions</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedFeedback.emotions.map((emotion, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              <Heart className="h-4 w-4 inline mr-1" />
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status & Priority</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                              {selectedFeedback.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                              {selectedFeedback.priority}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{selectedFeedback.category}</span>
                          </div>
                        </div>
                      </div>

                      {selectedFeedback.rating && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating</h3>
                          <div className="flex items-center">
                            {renderStarRating(selectedFeedback.rating)}
                            <span className="ml-2 text-lg font-medium">{selectedFeedback.rating}.0</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sentiment Analysis</h3>
                        <div className={`flex items-center justify-center p-4 rounded-lg ${getSentimentColor(selectedFeedback.sentiment)}`}>
                          {getSentimentIcon(selectedFeedback.sentiment)}
                          <span className="ml-2 font-medium capitalize">{selectedFeedback.sentiment}</span>
                        </div>
                        <div className="mt-2 text-center text-sm text-gray-500">
                          Score: {selectedFeedback.sentimentScore.toFixed(2)}
                        </div>
                      </div>

                      {selectedFeedback.customerData && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Info</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tier:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedFeedback.customerData.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                                selectedFeedback.customerData.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                selectedFeedback.customerData.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {selectedFeedback.customerData.tier}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Orders:</span>
                              <span className="font-medium">{selectedFeedback.customerData.ordersCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Spent:</span>
                              <span className="font-medium">${selectedFeedback.customerData.totalSpent.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Update Status
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
