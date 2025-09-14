'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Cloud, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  ShoppingCart,
  Webhook,
  Monitor,
  Lock,
  RefreshCw,
  ArrowRight,
  Info,
  X,
  Play,
  Pause
} from 'lucide-react';

interface ComponentNode {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'external' | 'service';
  position: { x: number; y: number };
  icon: React.ElementType;
  description: string;
  technologies: string[];
  connections: string[];
  metrics?: {
    uptime: string;
    responseTime: string;
    requests: string;
  };
  status: 'healthy' | 'warning' | 'error';
}

interface Connection {
  from: string;
  to: string;
  type: 'api' | 'webhook' | 'database' | 'auth';
  label: string;
  animated?: boolean;
}

const ARCHITECTURE_COMPONENTS: ComponentNode[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    type: 'frontend',
    position: { x: 100, y: 100 },
    icon: Monitor,
    description: 'React-based frontend with server-side rendering, interactive dashboards, and real-time analytics visualization.',
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    connections: ['api-gateway', 'auth-service'],
    metrics: {
      uptime: '99.9%',
      responseTime: '150ms',
      requests: '45,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    type: 'backend',
    position: { x: 400, y: 100 },
    icon: Server,
    description: 'Centralized API management with rate limiting, authentication, and request routing.',
    technologies: ['Next.js API Routes', 'Middleware', 'Rate Limiting', 'CORS'],
    connections: ['analytics-service', 'webhook-service', 'auth-service'],
    metrics: {
      uptime: '99.95%',
      responseTime: '45ms',
      requests: '120,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'auth-service',
    name: 'Authentication Service',
    type: 'service',
    position: { x: 400, y: 250 },
    icon: Shield,
    description: 'JWT-based authentication with multi-tenant support and role-based access control.',
    technologies: ['JWT', 'bcrypt', 'RBAC', 'Session Management'],
    connections: ['database'],
    metrics: {
      uptime: '99.99%',
      responseTime: '25ms',
      requests: '15,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'analytics-service',
    name: 'Analytics Engine',
    type: 'service',
    position: { x: 700, y: 100 },
    icon: BarChart3,
    description: 'Real-time analytics processing with advanced metrics calculation and data aggregation.',
    technologies: ['Node.js', 'Time Series DB', 'Data Pipeline', 'ML Models'],
    connections: ['database', 'shopify-api'],
    metrics: {
      uptime: '99.8%',
      responseTime: '200ms',
      requests: '80,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'webhook-service',
    name: 'Webhook Handler',
    type: 'service',
    position: { x: 700, y: 250 },
    icon: Webhook,
    description: 'Secure webhook processing with signature validation and event handling.',
    technologies: ['HMAC Validation', 'Event Processing', 'Queue System'],
    connections: ['database', 'shopify-api'],
    metrics: {
      uptime: '99.9%',
      responseTime: '50ms',
      requests: '25,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'database',
    name: 'PostgreSQL Database',
    type: 'database',
    position: { x: 400, y: 400 },
    icon: Database,
    description: 'Primary database with optimized schemas, indexing, and connection pooling.',
    technologies: ['PostgreSQL 15', 'Prisma ORM', 'Connection Pooling', 'Indexing'],
    connections: [],
    metrics: {
      uptime: '99.95%',
      responseTime: '15ms',
      requests: '200,000/day'
    },
    status: 'healthy'
  },
  {
    id: 'shopify-api',
    name: 'Shopify API',
    type: 'external',
    position: { x: 1000, y: 175 },
    icon: ShoppingCart,
    description: 'External Shopify API for data synchronization and webhook notifications.',
    technologies: ['REST API', 'GraphQL', 'Webhooks', 'OAuth'],
    connections: [],
    metrics: {
      uptime: '99.5%',
      responseTime: '300ms',
      requests: '50,000/day'
    },
    status: 'warning'
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Logging',
    type: 'service',
    position: { x: 100, y: 250 },
    icon: Monitor,
    description: 'Comprehensive monitoring with error tracking, performance metrics, and alerting.',
    technologies: ['Sentry', 'Custom Logging', 'Health Checks', 'Metrics'],
    connections: ['nextjs-app', 'api-gateway'],
    metrics: {
      uptime: '99.99%',
      responseTime: '10ms',
      requests: '500,000/day'
    },
    status: 'healthy'
  }
];

const CONNECTIONS: Connection[] = [
  { from: 'nextjs-app', to: 'api-gateway', type: 'api', label: 'HTTP/REST API', animated: true },
  { from: 'api-gateway', to: 'analytics-service', type: 'api', label: 'Internal API' },
  { from: 'api-gateway', to: 'webhook-service', type: 'webhook', label: 'Webhook Events' },
  { from: 'api-gateway', to: 'auth-service', type: 'auth', label: 'Authentication' },
  { from: 'auth-service', to: 'database', type: 'database', label: 'User Data' },
  { from: 'analytics-service', to: 'database', type: 'database', label: 'Analytics Data' },
  { from: 'webhook-service', to: 'database', type: 'database', label: 'Event Data' },
  { from: 'analytics-service', to: 'shopify-api', type: 'api', label: 'Data Sync', animated: true },
  { from: 'webhook-service', to: 'shopify-api', type: 'webhook', label: 'Webhooks', animated: true },
  { from: 'monitoring', to: 'nextjs-app', type: 'api', label: 'Monitoring' },
  { from: 'monitoring', to: 'api-gateway', type: 'api', label: 'Health Checks' }
];

export default function InteractiveArchitecture() {
  const [selectedComponent, setSelectedComponent] = useState<ComponentNode | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleComponentClick = useCallback((component: ComponentNode) => {
    setSelectedComponent(component);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedComponent(null);
  }, []);

  const getConnectionPath = (from: ComponentNode, to: ComponentNode): string => {
    const fromX = from.position.x + 60; // Center of component
    const fromY = from.position.y + 30;
    const toX = to.position.x + 60;
    const toY = to.position.y + 30;

    // Create curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const offsetY = Math.abs(toX - fromX) * 0.2;

    return `M ${fromX} ${fromY} Q ${midX} ${midY - offsetY} ${toX} ${toY}`;
  };

  const getConnectionColor = (type: Connection['type']): string => {
    switch (type) {
      case 'api': return '#3b82f6'; // blue
      case 'webhook': return '#10b981'; // green
      case 'database': return '#8b5cf6'; // purple
      case 'auth': return '#f59e0b'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  const getComponentColor = (type: ComponentNode['type'], status: ComponentNode['status']): string => {
    if (status === 'error') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    
    switch (type) {
      case 'frontend': return '#3b82f6';
      case 'backend': return '#10b981';
      case 'service': return '#8b5cf6';
      case 'database': return '#f59e0b';
      case 'external': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const renderComponent = (component: ComponentNode) => {
    const Icon = component.icon;
    const isHovered = hoveredComponent === component.id;
    const isSelected = selectedComponent?.id === component.id;
    const color = getComponentColor(component.type, component.status);

    return (
      <g key={component.id} className="cursor-pointer">
        {/* Component background */}
        <rect
          x={component.position.x}
          y={component.position.y}
          width="120"
          height="60"
          rx="8"
          fill={isHovered || isSelected ? color : 'white'}
          stroke={color}
          strokeWidth={isSelected ? 3 : 2}
          className={`transition-all duration-200 ${isHovered ? 'drop-shadow-lg' : 'drop-shadow'}`}
          onClick={() => handleComponentClick(component)}
          onMouseEnter={() => setHoveredComponent(component.id)}
          onMouseLeave={() => setHoveredComponent(null)}
        />
        
        {/* Status indicator */}
        <circle
          cx={component.position.x + 105}
          cy={component.position.y + 15}
          r="6"
          fill={component.status === 'healthy' ? '#10b981' : component.status === 'warning' ? '#f59e0b' : '#ef4444'}
          className="drop-shadow-sm"
        />
        
        {/* Icon */}
        <foreignObject
          x={component.position.x + 10}
          y={component.position.y + 15}
          width="24"
          height="24"
        >
          <Icon 
            size={24} 
            color={isHovered || isSelected ? 'white' : color}
            className="transition-colors duration-200"
          />
        </foreignObject>
        
        {/* Component name */}
        <text
          x={component.position.x + 45}
          y={component.position.y + 25}
          fill={isHovered || isSelected ? 'white' : '#374151'}
          fontSize="12"
          fontWeight="600"
          className="pointer-events-none select-none"
        >
          {component.name}
        </text>
        
        {/* Technology stack */}
        <text
          x={component.position.x + 45}
          y={component.position.y + 40}
          fill={isHovered || isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280'}
          fontSize="10"
          className="pointer-events-none select-none"
        >
          {component.technologies[0]}
        </text>

        {/* Metrics overlay */}
        {showMetrics && component.metrics && (
          <g>
            <rect
              x={component.position.x}
              y={component.position.y + 65}
              width="120"
              height="40"
              rx="4"
              fill="rgba(0,0,0,0.8)"
              className="drop-shadow-lg"
            />
            <text x={component.position.x + 5} y={component.position.y + 78} fill="white" fontSize="9">
              ⏱ {component.metrics.responseTime}
            </text>
            <text x={component.position.x + 5} y={component.position.y + 90} fill="white" fontSize="9">
              📊 {component.metrics.requests}
            </text>
            <text x={component.position.x + 5} y={component.position.y + 102} fill="white" fontSize="9">
              ✅ {component.metrics.uptime}
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderConnection = (connection: Connection) => {
    const fromComponent = ARCHITECTURE_COMPONENTS.find(c => c.id === connection.from);
    const toComponent = ARCHITECTURE_COMPONENTS.find(c => c.id === connection.to);
    
    if (!fromComponent || !toComponent) return null;

    const path = getConnectionPath(fromComponent, toComponent);
    const color = getConnectionColor(connection.type);

    return (
      <g key={`${connection.from}-${connection.to}`}>
        {/* Connection line */}
        <path
          d={path}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeDasharray={connection.type === 'webhook' ? '5,5' : undefined}
          className={connection.animated && animationEnabled ? 'animate-pulse' : ''}
        />
        
        {/* Arrow head */}
        <defs>
          <marker
            id={`arrow-${connection.from}-${connection.to}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="3"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={color} />
          </marker>
        </defs>
        
        <path
          d={path}
          stroke={color}
          strokeWidth="2"
          fill="none"
          markerEnd={`url(#arrow-${connection.from}-${connection.to})`}
          strokeDasharray={connection.type === 'webhook' ? '5,5' : undefined}
          className={connection.animated && animationEnabled ? 'animate-pulse' : ''}
        />
        
        {/* Connection label */}
        <text
          x={(fromComponent.position.x + toComponent.position.x) / 2 + 60}
          y={(fromComponent.position.y + toComponent.position.y) / 2 + 15}
          fill={color}
          fontSize="10"
          fontWeight="500"
          className="pointer-events-none select-none bg-white px-1 rounded"
        >
          {connection.label}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg p-6">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Architecture</h2>
          <p className="text-gray-600">Interactive diagram showing Shoplytics components and data flow</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showMetrics ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Metrics
          </button>
          
          <button
            onClick={() => setAnimationEnabled(!animationEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              animationEnabled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {animationEnabled ? (
              <Pause className="h-4 w-4 inline mr-2" />
            ) : (
              <Play className="h-4 w-4 inline mr-2" />
            )}
            Animation
          </button>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-lg border-2 border-gray-200 overflow-auto">
        <svg
          ref={svgRef}
          width="1200"
          height="600"
          viewBox="0 0 1200 600"
          className="w-full h-auto"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Render connections first (behind components) */}
          {CONNECTIONS.map(connection => renderConnection(connection))}
          
          {/* Render components */}
          {ARCHITECTURE_COMPONENTS.map(component => renderComponent(component))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-blue-600"></div>
          <span className="text-sm text-gray-600">Frontend</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <span className="text-sm text-gray-600">Backend</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-purple-600"></div>
          <span className="text-sm text-gray-600">Service</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-yellow-600"></div>
          <span className="text-sm text-gray-600">Database</span>
        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getComponentColor(selectedComponent.type, selectedComponent.status) }}
                  >
                    <selectedComponent.icon size={24} color="white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedComponent.name}</h3>
                    <span className="text-sm text-gray-500 capitalize">{selectedComponent.type}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-700 mb-6">{selectedComponent.description}</p>

              {/* Technologies */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComponent.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              {selectedComponent.metrics && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedComponent.metrics.uptime}</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedComponent.metrics.responseTime}</div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedComponent.metrics.requests}</div>
                      <div className="text-sm text-gray-600">Daily Requests</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connections */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Connections</h4>
                <div className="space-y-2">
                  {selectedComponent.connections.map((connectionId, index) => {
                    const connectedComponent = ARCHITECTURE_COMPONENTS.find(c => c.id === connectionId);
                    if (!connectedComponent) return null;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <ArrowRight size={16} className="text-gray-400" />
                        <connectedComponent.icon size={20} color={getComponentColor(connectedComponent.type, connectedComponent.status)} />
                        <span className="text-gray-700">{connectedComponent.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
