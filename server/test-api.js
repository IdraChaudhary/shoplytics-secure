#!/usr/bin/env node

/**
 * Shoplytics Secure API Test Script
 * 
 * This script demonstrates how to use all the API endpoints.
 * Run this script to test your API endpoints after starting the server.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
let API_KEY = ''; // Will be populated after tenant registration

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logTest(message) {
  log(`🧪 ${message}`, colors.yellow + colors.bold);
}

// Test functions
async function testHealthCheck() {
  logTest('Testing health check endpoint...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    
    if (response.data.status === 'healthy') {
      logSuccess('Health check passed');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Health check failed');
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
  }
  
  console.log('');
}

async function testTenantRegistration() {
  logTest('Testing tenant registration...');
  
  const registrationData = {
    name: 'Test Fashion Store',
    email: 'test@testfashionstore.com',
    shopifyStoreUrl: 'testfashionstore.myshopify.com',
    shopifyAccessToken: 'shpat_test_token_1234567890abcdef1234567890abcdef',
    planType: 'professional'
  };
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/tenant/register`,
      registrationData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      logSuccess('Tenant registration successful');
      API_KEY = response.data.data.tenant.apiKey;
      logInfo(`API Key: ${API_KEY}`);
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Tenant registration failed');
    }
  } catch (error) {
    if (error.response?.status === 409) {
      logInfo('Tenant already exists - that\'s okay for testing');
      // For demo purposes, use a test API key
      API_KEY = 'sk_test_1234567890abcdef1234567890abcdef12345678';
    } else {
      logError(`Tenant registration failed: ${error.message}`);
      if (error.response?.data) {
        console.log(JSON.stringify(error.response.data, null, 2));
      }
    }
  }
  
  console.log('');
}

async function testWebhookEndpoint() {
  logTest('Testing Shopify webhook endpoint...');
  
  const webhookData = {
    id: 123456789,
    name: '#TEST-001',
    email: 'customer@example.com',
    created_at: '2024-09-13T10:30:00Z',
    updated_at: '2024-09-13T10:30:00Z',
    total_price: '149.99',
    subtotal_price: '135.99',
    total_tax: '14.00',
    currency: 'USD',
    financial_status: 'paid',
    fulfillment_status: 'unfulfilled',
    customer: {
      id: 987654321,
      email: 'customer@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1-555-0123',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-09-13T10:30:00Z'
    },
    line_items: [
      {
        id: 111111111,
        product_id: 222222222,
        variant_id: 333333333,
        title: 'Classic White Shirt',
        quantity: 2,
        price: '67.99',
        sku: 'CWS-001',
        vendor: 'Fashion Co'
      }
    ]
  };
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/shopify/webhook`,
      webhookData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Topic': 'orders/create',
          'X-Shopify-Hmac-Sha256': 'mock-hmac-signature-for-testing',
          'X-Tenant-ID': 'test-tenant-123'
        }
      }
    );
    
    if (response.data.success) {
      logSuccess('Webhook processing successful');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Webhook processing failed');
    }
  } catch (error) {
    logError(`Webhook processing failed: ${error.message}`);
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('');
}

async function testAnalyticsOverview() {
  logTest('Testing analytics overview endpoint...');
  
  if (!API_KEY) {
    logError('No API key available - skipping analytics tests');
    return;
  }
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/overview/123`,
      {
        headers: {
          'X-API-Key': API_KEY
        },
        params: {
          from: '2024-08-01',
          to: '2024-09-13'
        }
      }
    );
    
    if (response.data.success) {
      logSuccess('Analytics overview successful');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Analytics overview failed');
    }
  } catch (error) {
    logError(`Analytics overview failed: ${error.message}`);
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('');
}

async function testOrdersAnalytics() {
  logTest('Testing orders analytics endpoint...');
  
  if (!API_KEY) {
    logError('No API key available - skipping orders analytics test');
    return;
  }
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/orders/123`,
      {
        headers: {
          'X-API-Key': API_KEY
        },
        params: {
          from: '2024-09-01',
          to: '2024-09-13',
          groupBy: 'day',
          limit: 10
        }
      }
    );
    
    if (response.data.success) {
      logSuccess('Orders analytics successful');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Orders analytics failed');
    }
  } catch (error) {
    logError(`Orders analytics failed: ${error.message}`);
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('');
}

async function testTopCustomers() {
  logTest('Testing top customers endpoint...');
  
  if (!API_KEY) {
    logError('No API key available - skipping top customers test');
    return;
  }
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/customers/top/123`,
      {
        headers: {
          'X-API-Key': API_KEY
        },
        params: {
          limit: 5
        }
      }
    );
    
    if (response.data.success) {
      logSuccess('Top customers analytics successful');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      logError('Top customers analytics failed');
    }
  } catch (error) {
    logError(`Top customers analytics failed: ${error.message}`);
    if (error.response?.data) {
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('');
}

async function testErrorHandling() {
  logTest('Testing error handling...');
  
  try {
    // Test 404 error
    const response = await axios.get(`${API_BASE_URL}/api/nonexistent`);
  } catch (error) {
    if (error.response?.status === 404) {
      logSuccess('404 error handling working correctly');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      logError('Unexpected error response');
    }
  }
  
  console.log('');
}

async function testRateLimiting() {
  logTest('Testing rate limiting (this may take a moment)...');
  
  const requests = Array.from({ length: 10 }, (_, i) => 
    axios.get(`${API_BASE_URL}/health`).catch(err => ({
      status: err.response?.status,
      data: err.response?.data
    }))
  );
  
  try {
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      logSuccess('Rate limiting is working');
    } else {
      logInfo('Rate limiting not triggered (that\'s normal for small request volumes)');
    }
  } catch (error) {
    logError(`Rate limiting test failed: ${error.message}`);
  }
  
  console.log('');
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Shoplytics Secure API Tests', colors.cyan + colors.bold);
  log('==========================================', colors.cyan);
  console.log('');
  
  // Check if server is running
  try {
    await axios.get(`${API_BASE_URL}/health`);
  } catch (error) {
    logError('API server is not running! Please start it with: npm run api:dev');
    process.exit(1);
  }
  
  // Run all tests
  await testHealthCheck();
  await testTenantRegistration();
  await testWebhookEndpoint();
  await testAnalyticsOverview();
  await testOrdersAnalytics();
  await testTopCustomers();
  await testErrorHandling();
  await testRateLimiting();
  
  log('🏁 All API tests completed!', colors.cyan + colors.bold);
  log('==========================================', colors.cyan);
  console.log('');
  
  if (API_KEY) {
    logInfo(`Your test API key: ${API_KEY}`);
    logInfo('You can use this API key to test the endpoints manually.');
  }
  
  logInfo('For more examples, check the API_DOCUMENTATION.md file.');
}

// Error handling for the test script
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:', error);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError('Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testHealthCheck,
  testTenantRegistration,
  testWebhookEndpoint,
  testAnalyticsOverview,
  testOrdersAnalytics,
  testTopCustomers,
  testErrorHandling,
  testRateLimiting
};
