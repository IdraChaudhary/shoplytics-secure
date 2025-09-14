'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  BarChart3,
  Users,
  Clock,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Monitor,
  Server,
  Database,
  Wifi,
  Download,
  Settings,
  RefreshCw,
  StopCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadTestScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  userRampUp: number; // users per second
  maxUsers: number;
  userBehavior: UserBehavior[];
  endpoints: TestEndpoint[];
  assertions: TestAssertion[];
}

interface UserBehavior {
  id: string;
  name: string;
  weight: number; // percentage of users
  actions: UserAction[];
}

interface UserAction {
  id: string;
  type: 'request' | 'wait' | 'think' | 'loop';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  duration?: number;
  data?: any;
  probability?: number;
}

interface TestEndpoint {
  id: string;
  path: string;
  method: string;
  expectedResponseTime: number;
  expectedStatusCode: number;
  weight: number;
}

interface TestAssertion {
  id: string;
  type: 'response_time' | 'status_code' | 'throughput' | 'error_rate';
  threshold: number;
  operator: '<' | '>' | '=' | '!=' | '<=' | '>=';
  description: string;
}

interface LoadTestResult {
  id: string;
  scenario: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    throughput: number;
  };
  timeline: Array<{
    timestamp: string;
    activeUsers: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  }>;
}

const SAMPLE_SCENARIOS: LoadTestScenario[] = [
  {
    id: 'dashboard-load',
    name: 'Dashboard Load Test',
    description: 'Simulates typical dashboard usage patterns with varying user loads',
    duration: 300, // 5 minutes
    userRampUp: 5,
    maxUsers: 100,
    userBehavior: [
      {
        id: 'casual-browser',
        name: 'Casual Browser',
        weight: 60,
        actions: [
          { id: '1', type: 'request', endpoint: '/dashboard', method: 'GET' },
          { id: '2', type: 'think', duration: 5000 },
          { id: '3', type: 'request', endpoint: '/api/dashboard/metrics', method: 'GET' },
          { id: '4', type: 'wait', duration: 10000 },
          { id: '5', type: 'request', endpoint: '/analytics', method: 'GET', probability: 0.3 },
        ]
      },
      {
        id: 'power-user',
        name: 'Power User',
        weight: 30,
        actions: [
          { id: '1', type: 'request', endpoint: '/dashboard', method: 'GET' },
          { id: '2', type: 'request', endpoint: '/api/dashboard/metrics', method: 'GET' },
          { id: '3', type: 'request', endpoint: '/api/dashboard/analytics', method: 'GET' },
          { id: '4', type: 'think', duration: 2000 },
          { id: '5', type: 'request', endpoint: '/settings', method: 'GET' },
          { id: '6', type: 'loop', duration: 30000 },
        ]
      },
      {
        id: 'api-consumer',
        name: 'API Consumer',
        weight: 10,
        actions: [
          { id: '1', type: 'request', endpoint: '/api/dashboard/metrics', method: 'GET' },
          { id: '2', type: 'wait', duration: 1000 },
          { id: '3', type: 'request', endpoint: '/api/dashboard/analytics', method: 'GET' },
          { id: '4', type: 'wait', duration: 1000 },
          { id: '5', type: 'loop', duration: 5000 },
        ]
      }
    ],
    endpoints: [
      { id: '1', path: '/dashboard', method: 'GET', expectedResponseTime: 500, expectedStatusCode: 200, weight: 40 },
      { id: '2', path: '/api/dashboard/metrics', method: 'GET', expectedResponseTime: 200, expectedStatusCode: 200, weight: 30 },
      { id: '3', path: '/api/dashboard/analytics', method: 'GET', expectedResponseTime: 800, expectedStatusCode: 200, weight: 20 },
      { id: '4', path: '/analytics', method: 'GET', expectedResponseTime: 1000, expectedStatusCode: 200, weight: 10 },
    ],
    assertions: [
      { id: '1', type: 'response_time', threshold: 1000, operator: '<', description: 'Average response time should be under 1s' },
      { id: '2', type: 'error_rate', threshold: 5, operator: '<', description: 'Error rate should be under 5%' },
      { id: '3', type: 'throughput', threshold: 100, operator: '>', description: 'Throughput should be over 100 req/s' },
    ]
  },
  {
    id: 'api-stress',
    name: 'API Stress Test',
    description: 'High-intensity API testing to find breaking points',
    duration: 180, // 3 minutes
    userRampUp: 10,
    maxUsers: 500,
    userBehavior: [
      {
        id: 'aggressive-api',
        name: 'Aggressive API User',
        weight: 100,
        actions: [
          { id: '1', type: 'request', endpoint: '/api/dashboard/metrics', method: 'GET' },
          { id: '2', type: 'request', endpoint: '/api/dashboard/analytics', method: 'GET' },
          { id: '3', type: 'wait', duration: 100 },
          { id: '4', type: 'loop', duration: 1000 },
        ]
      }
    ],
    endpoints: [
      { id: '1', path: '/api/dashboard/metrics', method: 'GET', expectedResponseTime: 200, expectedStatusCode: 200, weight: 50 },
      { id: '2', path: '/api/dashboard/analytics', method: 'GET', expectedResponseTime: 300, expectedStatusCode: 200, weight: 50 },
    ],
    assertions: [
      { id: '1', type: 'response_time', threshold: 2000, operator: '<', description: 'Response time should remain under 2s under stress' },
      { id: '2', type: 'error_rate', threshold: 10, operator: '<', description: 'Error rate should not exceed 10%' },
    ]
  },
  {
    id: 'spike-test',
    name: 'Spike Test',
    description: 'Sudden spike in traffic to test auto-scaling capabilities',
    duration: 120, // 2 minutes
    userRampUp: 50,
    maxUsers: 1000,
    userBehavior: [
      {
        id: 'spike-user',
        name: 'Spike User',
        weight: 100,
        actions: [
          { id: '1', type: 'request', endpoint: '/dashboard', method: 'GET' },
          { id: '2', type: 'request', endpoint: '/api/dashboard/metrics', method: 'GET' },
          { id: '3', type: 'wait', duration: 1000 },
        ]
      }
    ],
    endpoints: [
      { id: '1', path: '/dashboard', method: 'GET', expectedResponseTime: 1000, expectedStatusCode: 200, weight: 60 },
      { id: '2', path: '/api/dashboard/metrics', method: 'GET', expectedResponseTime: 500, expectedStatusCode: 200, weight: 40 },
    ],
    assertions: [
      { id: '1', type: 'response_time', threshold: 3000, operator: '<', description: 'Should handle spike without timing out' },
      { id: '2', type: 'error_rate', threshold: 15, operator: '<', description: 'Error rate should remain manageable during spike' },
    ]
  }
];

export default function LoadTestingPage() {
  const [selectedScenario, setSelectedScenario] = useState<LoadTestScenario | null>(null);
  const [currentTest, setCurrentTest] = useState<LoadTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testHistory, setTestHistory] = useState<LoadTestResult[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    throughput: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const testStartTime = useRef<Date | null>(null);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateTestResult = (scenario: LoadTestScenario): LoadTestResult => {
    const now = new Date().toISOString();
    return {
      id: `test-${Date.now()}`,
      scenario: scenario.name,
      startTime: now,
      status: 'running',
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        throughput: 0
      },
      timeline: []
    };
  };

  const simulateLoadTest = (scenario: LoadTestScenario) => {
    let elapsedTime = 0;
    let currentUsers = 0;
    
    const updateMetrics = () => {
      elapsedTime += 1;
      
      // Simulate user ramp-up
      if (currentUsers < scenario.maxUsers && elapsedTime < scenario.duration * 0.8) {
        currentUsers = Math.min(
          scenario.maxUsers,
          Math.floor(elapsedTime * scenario.userRampUp)
        );
      }
      
      // Simulate realistic metrics based on load
      const baseResponseTime = 200;
      const loadFactor = currentUsers / scenario.maxUsers;
      const avgResponseTime = baseResponseTime + (loadFactor * 800) + (Math.random() * 200);
      const errorRate = Math.max(0, (loadFactor - 0.7) * 10 + Math.random() * 2);
      const rps = Math.min(currentUsers * 2, scenario.maxUsers * 1.5) * (1 - errorRate / 100);
      
      const newMetrics = {
        activeUsers: currentUsers,
        requestsPerSecond: Math.round(rps),
        averageResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        throughput: Math.round(rps * 0.8)
      };
      
      setRealTimeMetrics(newMetrics);
      
      // Update test result
      if (currentTest) {
        const updatedTest: LoadTestResult = {
          ...currentTest,
          metrics: {
            totalRequests: currentTest.metrics.totalRequests + rps,
            successfulRequests: currentTest.metrics.successfulRequests + (rps * (1 - errorRate / 100)),
            failedRequests: currentTest.metrics.failedRequests + (rps * errorRate / 100),
            averageResponseTime: avgResponseTime,
            maxResponseTime: Math.max(currentTest.metrics.maxResponseTime, avgResponseTime * 1.5),
            minResponseTime: currentTest.metrics.minResponseTime || avgResponseTime * 0.5,
            requestsPerSecond: rps,
            errorRate: errorRate,
            throughput: rps * 0.8
          },
          timeline: [
            ...currentTest.timeline,
            {
              timestamp: new Date().toISOString(),
              activeUsers: currentUsers,
              responseTime: avgResponseTime,
              throughput: rps * 0.8,
              errorRate: errorRate
            }
          ]
        };
        
        setCurrentTest(updatedTest);
      }
      
      // Check if test should end
      if (elapsedTime >= scenario.duration) {
        stopTest(true);
      }
    };
    
    intervalRef.current = setInterval(updateMetrics, 1000);
  };

  const startTest = (scenario: LoadTestScenario) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSelectedScenario(scenario);
    testStartTime.current = new Date();
    
    const testResult = generateTestResult(scenario);
    setCurrentTest(testResult);
    
    // Start simulation
    simulateLoadTest(scenario);
  };

  const stopTest = (completed = false) => {
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (currentTest) {
      const finalResult: LoadTestResult = {
        ...currentTest,
        endTime: new Date().toISOString(),
        status: completed ? 'completed' : 'stopped'
      };
      
      setTestHistory(prev => [finalResult, ...prev.slice(0, 9)]); // Keep last 10 tests
      setCurrentTest(null);
    }
    
    setRealTimeMetrics({
      activeUsers: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const checkAssertions = (scenario: LoadTestScenario, metrics: any) => {
    return scenario.assertions.map(assertion => {
      let value = 0;
      switch (assertion.type) {
        case 'response_time':
          value = metrics.averageResponseTime;
          break;
        case 'error_rate':
          value = metrics.errorRate;
          break;
        case 'throughput':
          value = metrics.throughput;
          break;
      }
      
      let passed = false;
      switch (assertion.operator) {
        case '<': passed = value < assertion.threshold; break;
        case '>': passed = value > assertion.threshold; break;
        case '=': passed = value === assertion.threshold; break;
        case '!=': passed = value !== assertion.threshold; break;
        case '<=': passed = value <= assertion.threshold; break;
        case '>=': passed = value >= assertion.threshold; break;
      }
      
      return { ...assertion, value, passed };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 mr-3 text-purple-600" />
                Load Testing Suite
              </h1>
              <p className="mt-2 text-gray-600">Simulate realistic user behavior and test system performance under load</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isRunning ? 'Running' : 'Ready'}
                </span>
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Config
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Real-time Metrics */}
            {isRunning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Live Metrics</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      Live
                    </div>
                    <button
                      onClick={() => stopTest(false)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Stop Test
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">{realTimeMetrics.activeUsers}</div>
                        <div className="text-sm text-blue-600">Active Users</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold text-green-900">{realTimeMetrics.requestsPerSecond}</div>
                        <div className="text-sm text-green-600">Req/sec</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold text-yellow-900">{realTimeMetrics.averageResponseTime}ms</div>
                        <div className="text-sm text-yellow-600">Avg Response</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold text-red-900">{realTimeMetrics.errorRate}%</div>
                        <div className="text-sm text-red-600">Error Rate</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">{realTimeMetrics.throughput}</div>
                        <div className="text-sm text-purple-600">Throughput</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assertions Status */}
                {selectedScenario && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Test Assertions</h3>
                    <div className="space-y-2">
                      {checkAssertions(selectedScenario, realTimeMetrics).map((assertion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{assertion.description}</span>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">
                              {assertion.value.toFixed(1)} {assertion.operator} {assertion.threshold}
                            </span>
                            {assertion.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Test Scenarios */}
            {!isRunning && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Load Test Scenarios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SAMPLE_SCENARIOS.map((scenario) => (
                    <div key={scenario.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
                        <div className="text-sm text-gray-500">
                          {formatTime(scenario.duration)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Max Users:</span>
                          <span className="font-medium">{scenario.maxUsers}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Ramp-up:</span>
                          <span className="font-medium">{scenario.userRampUp}/sec</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Endpoints:</span>
                          <span className="font-medium">{scenario.endpoints.length}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">User Behaviors:</div>
                        {scenario.userBehavior.map((behavior) => (
                          <div key={behavior.id} className="flex justify-between text-xs text-gray-600">
                            <span>{behavior.name}</span>
                            <span>{behavior.weight}%</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => startTest(scenario)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test History */}
            {testHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Test History</h2>
                <div className="space-y-4">
                  {testHistory.map((test) => (
                    <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{test.scenario}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(test.startTime).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{Math.round(test.metrics.totalRequests)}</div>
                          <div className="text-sm text-gray-500">Total Requests</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{Math.round(test.metrics.averageResponseTime)}ms</div>
                          <div className="text-sm text-gray-500">Avg Response Time</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{test.metrics.errorRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">Error Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">{Math.round(test.metrics.requestsPerSecond)}</div>
                          <div className="text-sm text-gray-500">Peak RPS</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* System Resources */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                System Resources
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="font-medium">{isRunning ? Math.round(35 + realTimeMetrics.activeUsers * 0.1) : 12}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${isRunning ? Math.round(35 + realTimeMetrics.activeUsers * 0.1) : 12}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Memory</span>
                    <span className="font-medium">{isRunning ? Math.round(45 + realTimeMetrics.activeUsers * 0.15) : 28}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${isRunning ? Math.round(45 + realTimeMetrics.activeUsers * 0.15) : 28}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Network I/O</span>
                    <span className="font-medium">{isRunning ? Math.round(realTimeMetrics.throughput * 0.1) : 5} MB/s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, isRunning ? realTimeMetrics.throughput * 0.2 : 5)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                Test Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Environment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    <option>Local Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                  <input
                    type="text"
                    value="http://localhost:3000"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Think Time (ms)</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    defaultValue="1000"
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">1000ms</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (s)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </button>
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear History
                </button>
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
