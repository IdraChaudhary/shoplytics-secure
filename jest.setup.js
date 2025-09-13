import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.ENCRYPTION_MASTER_KEY = 'test-master-encryption-key-for-testing-purposes-only';
process.env.ENCRYPTION_SALT = 'test-salt-for-testing';
process.env.NODE_ENV = 'test';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock crypto for Node.js environment
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'analyst',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockStore: () => ({
    id: 'test-store-id',
    shopifyDomain: 'test-store.myshopify.com',
    storeName: 'Test Store',
    currency: 'USD',
    isActive: true,
    encryptionEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  
  createMockCustomer: () => ({
    id: 'test-customer-id',
    storeId: 'test-store-id',
    shopifyCustomerId: '12345',
    email: 'customer@example.com', // This would be encrypted in real data
    firstName: 'John',
    lastName: 'Doe',
    totalOrders: 5,
    totalSpent: '250.00',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};
