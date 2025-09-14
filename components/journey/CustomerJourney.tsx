'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Eye,
  ShoppingCart,
  CreditCard,
  Package,
  Heart,
  Share2,
  MessageCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  metrics: {
    users: number;
    conversionRate: number;
    avgTime: string;
    dropoffRate: number;
  };
  actions: string[];
  touchpoints: string[];
  position: { x: number; y: number };
}

interface JourneyFlow {
  from: string;
  to: string;
  users: number;
  conversionRate: number;
  avgTime: string;
  label: string;
}

interface CustomerSegment {
  id: string;
  name: string;
  color: string;
  percentage: number;
  characteristics: string[];
}

const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    id: 'new-visitors',
    name: 'New Visitors',
    color: '#3b82f6',
    percentage: 45,
    characteristics: ['First-time visitors', 'High discovery intent', 'Price sensitive']
  },
  {
    id: 'returning-customers',
    name: 'Returning Customers',
    color: '#10b981',
    percentage: 35,
    characteristics: ['Previous purchasers', 'Brand loyal', 'Higher AOV']
  },
  {
    id: 'cart-abandoners',
    name: 'Cart Abandoners',
    color: '#f59e0b',
    percentage: 20,
    characteristics: ['Added to cart but didn\'t purchase', 'Need incentives', 'Mobile users']
  }
];

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Customer discovers your brand or products through various channels',
    icon: Search,
    color: '#6366f1',
    position: { x: 50, y: 200 },
    metrics: {
      users: 10000,
      conversionRate: 15.2,
      avgTime: '45s',
      dropoffRate: 84.8
    },
    actions: ['Search queries', 'Social media discovery', 'Ad clicks', 'Referral visits'],
    touchpoints: ['Google Search', 'Facebook Ads', 'Instagram', 'Referral sites']
  },
  {
    id: 'interest',
    name: 'Interest',
    description: 'Customer shows interest by browsing products and engaging with content',
    icon: Eye,
    color: '#8b5cf6',
    position: { x: 250, y: 150 },
    metrics: {
      users: 1520,
      conversionRate: 28.9,
      avgTime: '3m 20s',
      dropoffRate: 71.1
    },
    actions: ['Product page views', 'Category browsing', 'Blog reading', 'Video watching'],
    touchpoints: ['Product pages', 'Blog posts', 'Product videos', 'Reviews']
  },
  {
    id: 'consideration',
    name: 'Consideration',
    description: 'Customer evaluates products and compares options',
    icon: Heart,
    color: '#06b6d4',
    position: { x: 450, y: 100 },
    metrics: {
      users: 439,
      conversionRate: 42.6,
      avgTime: '8m 15s',
      dropoffRate: 57.4
    },
    actions: ['Wishlist additions', 'Product comparisons', 'Review reading', 'Size guide checks'],
    touchpoints: ['Comparison tools', 'Reviews section', 'Size guides', 'Q&A']
  },
  {
    id: 'intent',
    name: 'Purchase Intent',
    description: 'Customer shows strong buying signals and adds items to cart',
    icon: ShoppingCart,
    color: '#10b981',
    position: { x: 650, y: 150 },
    metrics: {
      users: 187,
      conversionRate: 65.2,
      avgTime: '5m 30s',
      dropoffRate: 34.8
    },
    actions: ['Add to cart', 'Promo code searches', 'Shipping checks', 'Stock verification'],
    touchpoints: ['Shopping cart', 'Promo banners', 'Shipping calculator', 'Stock indicators']
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Customer completes the transaction and makes a purchase',
    icon: CreditCard,
    color: '#059669',
    position: { x: 850, y: 200 },
    metrics: {
      users: 122,
      conversionRate: 85.2,
      avgTime: '2m 45s',
      dropoffRate: 14.8
    },
    actions: ['Checkout initiation', 'Payment info entry', 'Order confirmation', 'Receipt download'],
    touchpoints: ['Checkout page', 'Payment forms', 'Order confirmation', 'Email receipts']
  },
  {
    id: 'fulfillment',
    name: 'Fulfillment',
    description: 'Order processing, shipping, and delivery experience',
    icon: Package,
    color: '#dc2626',
    position: { x: 1050, y: 250 },
    metrics: {
      users: 104,
      conversionRate: 92.3,
      avgTime: '5-7 days',
      dropoffRate: 7.7
    },
    actions: ['Order tracking', 'Delivery updates', 'Package receipt', 'Unboxing experience'],
    touchpoints: ['Order tracking page', 'SMS/Email updates', 'Delivery notifications', 'Packaging']
  },
  {
    id: 'loyalty',
    name: 'Loyalty & Advocacy',
    description: 'Post-purchase experience and customer retention',
    icon: Share2,
    color: '#7c3aed',
    position: { x: 850, y: 350 },
    metrics: {
      users: 96,
      conversionRate: 45.8,
      avgTime: '30+ days',
      dropoffRate: 54.2
    },
    actions: ['Product reviews', 'Referrals', 'Repeat purchases', 'Social sharing'],
    touchpoints: ['Review emails', 'Loyalty program', 'Referral system', 'Social media']
  }
];

const JOURNEY_FLOWS: JourneyFlow[] = [
  {
    from: 'awareness',
    to: 'interest',
    users: 1520,
    conversionRate: 15.2,
    avgTime: '45s',
    label: '15.2%'
  },
  {
    from: 'interest',
    to: 'consideration',
    users: 439,
    conversionRate: 28.9,
    avgTime: '3m 20s',
    label: '28.9%'
  },
  {
    from: 'consideration',
    to: 'intent',
    users: 187,
    conversionRate: 42.6,
    avgTime: '8m 15s',
    label: '42.6%'
  },
  {
    from: 'intent',
    to: 'purchase',
    users: 122,
    conversionRate: 65.2,
    avgTime: '5m 30s',
    label: '65.2%'
  },
  {
    from: 'purchase',
    to: 'fulfillment',
    users: 104,
    conversionRate: 85.2,
    avgTime: '2m 45s',
    label: '85.2%'
  },
  {
    from: 'fulfillment',
    to: 'loyalty',
    users: 96,
    conversionRate: 92.3,
    avgTime: '5-7 days',
    label: '92.3%'
  }
];

export default function CustomerJourney() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [showMetrics, setShowMetrics] = useState(true);

  const selectedStageData = useMemo(() => {
    return JOURNEY_STAGES.find(stage => stage.id === selectedStage);
  }, [selectedStage]);

  const handleStageClick = useCallback((stageId: string) => {
    setSelectedStage(selectedStage === stageId ? null : stageId);
  }, [selectedStage]);

  const getFlowPath = (from: JourneyStage, to: JourneyStage): string => {
    const fromX = from.position.x + 80;
    const fromY = from.position.y + 40;
    const toX = to.position.x;
    const toY = to.position.y + 40;

    const midX = (fromX + toX) / 2;
    const curve = Math.abs(toY - fromY) * 0.5;

    return `M ${fromX} ${fromY} Q ${midX} ${fromY - curve} ${toX} ${toY}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const renderStage = (stage: JourneyStage) => {
    const Icon = stage.icon;
    const isSelected = selectedStage === stage.id;
    const isHovered = false; // You can add hover state if needed

    return (
      <g key={stage.id} className="cursor-pointer">
        {/* Stage circle */}
        <circle
          cx={stage.position.x + 40}
          cy={stage.position.y + 40}
          r="40"
          fill={isSelected || isHovered ? stage.color : 'white'}
          stroke={stage.color}
          strokeWidth={isSelected ? 4 : 2}
          className="transition-all duration-200 drop-shadow-lg"
          onClick={() => handleStageClick(stage.id)}
        />

        {/* Stage icon */}
        <foreignObject
          x={stage.position.x + 28}
          y={stage.position.y + 28}
          width="24"
          height="24"
          className="pointer-events-none"
        >
          <Icon 
            size={24} 
            color={isSelected || isHovered ? 'white' : stage.color}
            className="transition-colors duration-200"
          />
        </foreignObject>

        {/* Stage name */}
        <text
          x={stage.position.x + 40}
          y={stage.position.y + 100}
          textAnchor="middle"
          fill="#374151"
          fontSize="14"
          fontWeight="600"
          className="pointer-events-none select-none"
        >
          {stage.name}
        </text>

        {/* User count */}
        <text
          x={stage.position.x + 40}
          y={stage.position.y + 120}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="12"
          className="pointer-events-none select-none"
        >
          {formatNumber(stage.metrics.users)} users
        </text>

        {/* Metrics overlay */}
        {showMetrics && (
          <g>
            <rect
              x={stage.position.x - 10}
              y={stage.position.y - 40}
              width="100"
              height="30"
              rx="15"
              fill="rgba(0,0,0,0.8)"
              className="drop-shadow-lg"
            />
            <text
              x={stage.position.x + 40}
              y={stage.position.y - 20}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="600"
            >
              {stage.metrics.conversionRate}% conversion
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderFlow = (flow: JourneyFlow) => {
    const fromStage = JOURNEY_STAGES.find(s => s.id === flow.from);
    const toStage = JOURNEY_STAGES.find(s => s.id === flow.to);

    if (!fromStage || !toStage) return null;

    const path = getFlowPath(fromStage, toStage);
    const midX = (fromStage.position.x + toStage.position.x) / 2 + 40;
    const midY = (fromStage.position.y + toStage.position.y) / 2 + 20;

    const strokeWidth = Math.max(2, Math.min(20, flow.users / 20));

    return (
      <g key={`${flow.from}-${flow.to}`}>
        {/* Flow path */}
        <path
          d={path}
          stroke={fromStage.color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.6}
          className={animationEnabled ? 'animate-pulse' : ''}
        />

        {/* Flow arrow */}
        <defs>
          <marker
            id={`arrow-${flow.from}-${flow.to}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={fromStage.color} />
          </marker>
        </defs>

        <path
          d={path}
          stroke={fromStage.color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.6}
          markerEnd={`url(#arrow-${flow.from}-${flow.to})`}
          className={animationEnabled ? 'animate-pulse' : ''}
        />

        {/* Flow label */}
        <rect
          x={midX - 25}
          y={midY - 10}
          width="50"
          height="20"
          rx="10"
          fill="white"
          stroke={fromStage.color}
          strokeWidth="1"
        />
        <text
          x={midX}
          y={midY + 5}
          textAnchor="middle"
          fill={fromStage.color}
          fontSize="10"
          fontWeight="600"
        >
          {flow.label}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Journey Analysis</h2>
          <p className="text-gray-600">Interactive flow showing customer behavior and conversion rates</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showMetrics ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4 inline mr-2" />
            Metrics
          </button>

          <button
            onClick={() => setAnimationEnabled(!animationEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              animationEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {animationEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Segments</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedSegment('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSegment === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Customers
          </button>
          {CUSTOMER_SEGMENTS.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setSelectedSegment(segment.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                selectedSegment === segment.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedSegment === segment.id ? segment.color : undefined
              }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: segment.color }}
              />
              {segment.name} ({segment.percentage}%)
            </button>
          ))}
        </div>
      </div>

      {/* Journey Flow Diagram */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-auto mb-6">
        <svg
          width="1200"
          height="500"
          viewBox="0 0 1200 500"
          className="w-full h-auto"
        >
          {/* Grid background */}
          <defs>
            <pattern id="journey-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f9fafb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#journey-grid)" />

          {/* Render flows first (behind stages) */}
          {JOURNEY_FLOWS.map(flow => renderFlow(flow))}

          {/* Render stages */}
          {JOURNEY_STAGES.map(stage => renderStage(stage))}
        </svg>
      </div>

      {/* Stage Details Panel */}
      {selectedStageData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: selectedStageData.color }}
              >
                <selectedStageData.icon size={24} color="white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStageData.name}</h3>
                <p className="text-gray-600">{selectedStageData.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Key Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Users</span>
                  <span className="font-semibold">{formatNumber(selectedStageData.metrics.users)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-green-600">
                    {selectedStageData.metrics.conversionRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Time</span>
                  <span className="font-semibold">{selectedStageData.metrics.avgTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop-off Rate</span>
                  <span className="font-semibold text-red-600">
                    {selectedStageData.metrics.dropoffRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Customer Actions</h4>
              <div className="space-y-2">
                {selectedStageData.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Touchpoints */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Touchpoints</h4>
              <div className="space-y-2">
                {selectedStageData.touchpoints.map((touchpoint, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-700">{touchpoint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Optimization Tips</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {selectedStageData.id === 'awareness' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Improve SEO for better organic discovery</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>A/B test ad creatives for better CTR</span>
                    </div>
                  </>
                )}
                {selectedStageData.id === 'interest' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Add more product videos and demos</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Implement exit-intent popups</span>
                    </div>
                  </>
                )}
                {selectedStageData.id === 'consideration' && (
                  <>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Add more customer reviews and ratings</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Implement comparison tools</span>
                    </div>
                  </>
                )}
                {/* Add more optimization tips for other stages */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Conversion</p>
              <p className="text-2xl font-bold text-gray-900">1.22%</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+0.3% from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Journey Time</p>
              <p className="text-2xl font-bold text-gray-900">12.5 days</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2 flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">+2.1 days from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue per Visitor</p>
              <p className="text-2xl font-bold text-gray-900">$12.45</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+$1.85 from last month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cart Abandonment</p>
              <p className="text-2xl font-bold text-gray-900">34.8%</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500" />
          </div>
          <div className="mt-2 flex items-center">
            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">-2.4% from last month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
