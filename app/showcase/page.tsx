'use client';

import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  Award,
  Users,
  Target,
  Zap,
  BarChart3,
  ShoppingCart,
  Star,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'predictive' | 'classification' | 'recommendation' | 'optimization';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: string;
  useCase: string;
  businessImpact: string;
  status: 'production' | 'testing' | 'development';
}

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    improvement: string;
    value: string;
  }[];
  timeline: string;
  roi: string;
  testimonial: string;
  image: string;
}

interface CompetitorFeature {
  feature: string;
  shoplytics: 'yes' | 'no' | 'partial';
  competitor1: 'yes' | 'no' | 'partial';
  competitor2: 'yes' | 'no' | 'partial';
  competitor3: 'yes' | 'no' | 'partial';
  notes?: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'customer-churn-predictor',
    name: 'Customer Churn Predictor',
    description: 'ML model that predicts customer churn probability based on behavioral patterns, purchase history, and engagement metrics.',
    type: 'predictive',
    accuracy: 94.2,
    precision: 91.8,
    recall: 89.5,
    f1Score: 90.6,
    trainingData: '2.5M customer records, 18 months',
    useCase: 'Identify at-risk customers for retention campaigns',
    businessImpact: '35% reduction in churn rate, $2.1M annual savings',
    status: 'production'
  },
  {
    id: 'demand-forecasting',
    name: 'Demand Forecasting Engine',
    description: 'Advanced time series forecasting model for inventory optimization using seasonal trends, market conditions, and external factors.',
    type: 'predictive',
    accuracy: 87.3,
    precision: 88.9,
    recall: 85.7,
    f1Score: 87.3,
    trainingData: '5 years historical sales, 1000+ products',
    useCase: 'Optimize inventory levels and reduce stockouts',
    businessImpact: '42% reduction in overstock, 28% decrease in stockouts',
    status: 'production'
  },
  {
    id: 'recommendation-engine',
    name: 'Product Recommendation Engine',
    description: 'Hybrid recommendation system combining collaborative filtering, content-based filtering, and deep learning approaches.',
    type: 'recommendation',
    accuracy: 92.1,
    precision: 88.4,
    recall: 91.2,
    f1Score: 89.8,
    trainingData: '10M+ user interactions, product catalog',
    useCase: 'Personalized product recommendations',
    businessImpact: '24% increase in conversion rate, 18% higher AOV',
    status: 'production'
  },
  {
    id: 'price-optimizer',
    name: 'Dynamic Price Optimizer',
    description: 'AI-powered pricing optimization considering competitor prices, demand elasticity, and market conditions.',
    type: 'optimization',
    accuracy: 89.7,
    precision: 87.3,
    recall: 86.9,
    f1Score: 87.1,
    trainingData: 'Market prices, demand patterns, competitive data',
    useCase: 'Optimize pricing strategy for maximum profit',
    businessImpact: '15% increase in profit margins, 8% revenue growth',
    status: 'testing'
  }
];

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'fashionhub-transformation',
    title: 'E-commerce Transformation for FashionHub',
    client: 'FashionHub Inc.',
    industry: 'Fashion & Apparel',
    challenge: 'FashionHub was struggling with high cart abandonment rates (68%) and low customer retention. Their analytics were fragmented across multiple tools, making it difficult to get actionable insights.',
    solution: 'Implemented Shoplytics comprehensive analytics platform with AI-powered customer segmentation, personalized recommendations, and automated retention campaigns.',
    results: [
      { metric: 'Cart Abandonment', improvement: '-42%', value: 'From 68% to 26%' },
      { metric: 'Customer Retention', improvement: '+156%', value: 'From 23% to 59%' },
      { metric: 'Revenue Growth', improvement: '+89%', value: '$2.4M additional revenue' },
      { metric: 'AOV Increase', improvement: '+34%', value: 'From $67 to $90' }
    ],
    timeline: '6 months implementation + 12 months optimization',
    roi: '340%',
    testimonial: 'Shoplytics transformed our business. The AI insights helped us understand our customers better than ever before, leading to unprecedented growth.',
    image: '/case-studies/fashionhub.jpg'
  },
  {
    id: 'techgear-optimization',
    title: 'Inventory Optimization for TechGear Pro',
    client: 'TechGear Pro',
    industry: 'Electronics & Technology',
    challenge: 'TechGear Pro faced significant challenges with inventory management - 35% overstock on slow-moving items and frequent stockouts on popular products, resulting in lost sales and increased holding costs.',
    solution: 'Deployed advanced demand forecasting models and inventory optimization algorithms with real-time market trend analysis and automated reorder points.',
    results: [
      { metric: 'Inventory Turnover', improvement: '+67%', value: 'From 4.2x to 7.0x annually' },
      { metric: 'Stockout Reduction', improvement: '-73%', value: 'From 12% to 3.2%' },
      { metric: 'Holding Costs', improvement: '-45%', value: '$890K annual savings' },
      { metric: 'Sales Recovery', improvement: '+23%', value: 'From lost stockout sales' }
    ],
    timeline: '4 months implementation + 8 months monitoring',
    roi: '285%',
    testimonial: 'The demand forecasting accuracy exceeded our expectations. We now have the right products at the right time, every time.',
    image: '/case-studies/techgear.jpg'
  }
];

const COMPETITIVE_FEATURES: CompetitorFeature[] = [
  { feature: 'Real-time Analytics Dashboard', shoplytics: 'yes', competitor1: 'yes', competitor2: 'partial', competitor3: 'no' },
  { feature: 'AI-Powered Customer Segmentation', shoplytics: 'yes', competitor1: 'partial', competitor2: 'no', competitor3: 'no' },
  { feature: 'Predictive Churn Analysis', shoplytics: 'yes', competitor1: 'no', competitor2: 'no', competitor3: 'no' },
  { feature: 'Advanced Cohort Analysis', shoplytics: 'yes', competitor1: 'yes', competitor2: 'yes', competitor3: 'partial' },
  { feature: 'Custom Report Builder', shoplytics: 'yes', competitor1: 'yes', competitor2: 'partial', competitor3: 'yes' },
  { feature: 'API & Webhook Integration', shoplytics: 'yes', competitor1: 'partial', competitor2: 'yes', competitor3: 'partial' },
  { feature: 'Multi-tenant Architecture', shoplytics: 'yes', competitor1: 'no', competitor2: 'no', competitor3: 'yes' },
  { feature: 'White-label Solutions', shoplytics: 'yes', competitor1: 'no', competitor2: 'partial', competitor3: 'no' },
  { feature: 'GDPR Compliance', shoplytics: 'yes', competitor1: 'yes', competitor2: 'yes', competitor3: 'partial' },
  { feature: 'Mobile App', shoplytics: 'yes', competitor1: 'yes', competitor2: 'no', competitor3: 'yes' }
];

export default function ShowcasePage() {
  const [activeTab, setActiveTab] = useState<'models' | 'cases' | 'competitive' | 'roadmap'>('models');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedCaseStudy, setCaseStudy] = useState<CaseStudy | null>(null);

  const renderStatusBadge = (status: AIModel['status']) => {
    const colors = {
      production: 'bg-green-100 text-green-800',
      testing: 'bg-yellow-100 text-yellow-800',
      development: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderFeatureStatus = (status: 'yes' | 'no' | 'partial') => {
    switch (status) {
      case 'yes':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'no':
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-16 w-16 mr-4" />
              <h1 className="text-5xl font-bold">Innovation Showcase</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover cutting-edge AI models, real-world success stories, and competitive advantages 
              that make Shoplytics the leader in e-commerce analytics.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                <Play className="h-5 w-5 inline mr-2" />
                Watch Demo
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                <Download className="h-5 w-5 inline mr-2" />
                Download Whitepaper
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'models', label: 'AI Models', icon: Brain },
              { id: 'cases', label: 'Case Studies', icon: Award },
              { id: 'competitive', label: 'Competitive Analysis', icon: Target },
              { id: 'roadmap', label: 'Future Roadmap', icon: Zap }
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
        {/* AI Models Tab */}
        {activeTab === 'models' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">AI & Machine Learning Models</h2>
              <p className="text-lg text-gray-600">
                Explore our portfolio of production-ready AI models powering intelligent analytics and automation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {AI_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                        <span className="text-sm text-gray-500 capitalize">{model.type}</span>
                      </div>
                    </div>
                    {renderStatusBadge(model.status)}
                  </div>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{model.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{model.accuracy}%</div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{model.f1Score}%</div>
                      <div className="text-xs text-gray-500">F1 Score</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Use Case:</strong> {model.useCase}
                  </div>

                  <div className="flex items-center text-sm text-blue-600">
                    <span>View Details</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case Studies Tab */}
        {activeTab === 'cases' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-lg text-gray-600">
                Real-world case studies demonstrating measurable business impact and ROI.
              </p>
            </div>

            <div className="space-y-8">
              {CASE_STUDIES.map((study) => (
                <div
                  key={study.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{study.title}</h3>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">{study.client}</span>
                          <span className="mx-2">•</span>
                          <span>{study.industry}</span>
                          <span className="mx-2">•</span>
                          <span>{study.timeline}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">{study.roi}</div>
                        <div className="text-sm text-gray-500">ROI</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Challenge</h4>
                        <p className="text-gray-600 mb-6">{study.challenge}</p>

                        <h4 className="font-semibold text-gray-900 mb-3">Solution</h4>
                        <p className="text-gray-600">{study.solution}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Results</h4>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {study.results.map((result, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className={`text-2xl font-bold mb-1 ${
                                result.improvement.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {result.improvement}
                              </div>
                              <div className="text-sm text-gray-900 font-medium">{result.metric}</div>
                              <div className="text-xs text-gray-600">{result.value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <Star className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                            <div>
                              <div className="text-sm text-blue-900 italic">"{study.testimonial}"</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Analysis Tab */}
        {activeTab === 'competitive' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Competitive Advantage</h2>
              <p className="text-lg text-gray-600">
                See how Shoplytics compares to leading analytics platforms in the market.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex flex-col items-center">
                          <div className="font-bold text-blue-600">Shoplytics</div>
                          <div className="text-xs text-gray-400">(Our Platform)</div>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor A
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor B
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Competitor C
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {COMPETITIVE_FEATURES.map((feature, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {feature.feature}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {renderFeatureStatus(feature.shoplytics)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {renderFeatureStatus(feature.competitor1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {renderFeatureStatus(feature.competitor2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center">
                            {renderFeatureStatus(feature.competitor3)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Leader</h3>
                <p className="text-gray-600">Leading in AI-powered features with 94% customer satisfaction</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fastest Growth</h3>
                <p className="text-gray-600">300% year-over-year growth with enterprise clients</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation First</h3>
                <p className="text-gray-600">First to market with predictive churn analysis and automated insights</p>
              </div>
            </div>
          </div>
        )}

        {/* Future Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Future Roadmap</h2>
              <p className="text-lg text-gray-600">
                Upcoming features and innovations that will shape the future of e-commerce analytics.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  quarter: 'Q1 2025',
                  title: 'Advanced Computer Vision',
                  description: 'AI-powered product image analysis for automated tagging and quality assessment',
                  status: 'development',
                  impact: 'High'
                },
                {
                  quarter: 'Q2 2025',
                  title: 'Real-time Personalization Engine',
                  description: 'Sub-second personalized recommendations using edge computing and streaming ML',
                  status: 'planning',
                  impact: 'High'
                },
                {
                  quarter: 'Q3 2025',
                  title: 'Voice Analytics Integration',
                  description: 'Natural language querying and voice-activated dashboard controls',
                  status: 'research',
                  impact: 'Medium'
                },
                {
                  quarter: 'Q4 2025',
                  title: 'Blockchain Supply Chain Tracking',
                  description: 'End-to-end supply chain transparency and provenance tracking',
                  status: 'research',
                  impact: 'Medium'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {item.quarter}
                        </span>
                        <span className={`ml-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          item.status === 'development' ? 'bg-green-100 text-green-800' :
                          item.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <div className="ml-6 text-right">
                      <div className={`inline-flex items-center text-sm font-medium ${
                        item.impact === 'High' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        <Activity className="h-4 w-4 mr-1" />
                        {item.impact} Impact
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Join Our Innovation Journey</h3>
              <p className="text-blue-100 mb-6">
                Be part of the future of e-commerce analytics. Get early access to beta features and shape our roadmap.
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                <ExternalLink className="h-5 w-5 inline mr-2" />
                Join Beta Program
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Model Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedModel.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 capitalize">{selectedModel.type} Model</span>
                    {renderStatusBadge(selectedModel.status)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-700 mb-8">{selectedModel.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Accuracy', value: selectedModel.accuracy },
                      { label: 'Precision', value: selectedModel.precision },
                      { label: 'Recall', value: selectedModel.recall },
                      { label: 'F1 Score', value: selectedModel.f1Score }
                    ].map(metric => (
                      <div key={metric.label} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{metric.value}%</div>
                        <div className="text-sm text-gray-600">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Details</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Training Data</div>
                      <div className="text-sm text-gray-600">{selectedModel.trainingData}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Use Case</div>
                      <div className="text-sm text-gray-600">{selectedModel.useCase}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Business Impact</div>
                      <div className="text-sm text-gray-600">{selectedModel.businessImpact}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setSelectedModel(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
