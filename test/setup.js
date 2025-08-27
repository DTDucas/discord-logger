// Test setup file for Discord Logger
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
  console.info = jest.fn();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
global.TestUtils = {
  // Mock Discord webhook URL
  MOCK_WEBHOOK_URL: 'https://discord.com/api/webhooks/123456789/mock_webhook_token',
  
  // Mock GitHub token
  MOCK_GITHUB_TOKEN: 'ghp_mock_github_token_for_testing',
  
  // Helper to create mock response
  mockResponse: (status = 200, data = {}) => ({
    status,
    data,
    headers: {},
    config: {},
    statusText: 'OK'
  }),
  
  // Helper to create mock error
  mockError: (message = 'Mock error', status = 500) => {
    const error = new Error(message);
    error.response = {
      status,
      data: { message },
      headers: {}
    };
    return error;
  },
  
  // Helper to wait for promises
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create test data
  createTestData: (size = 'small') => {
    const sizes = {
      small: { message: 'test', data: { key: 'value' } },
      medium: { 
        message: 'test message', 
        data: { 
          key: 'value',
          nested: { deep: 'data' },
          array: [1, 2, 3, 4, 5]
        }
      },
      large: {
        message: 'large test message',
        data: {
          largeArray: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            description: `Description for item ${i}`.repeat(10)
          })),
          metadata: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: 'test'
          }
        }
      }
    };
    return sizes[size] || sizes.small;
  }
};

// Global mocks
global.fetch = jest.fn();

// Mock axios if available
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock setTimeout and setInterval for timer tests
jest.useFakeTimers();

// Add custom matchers
expect.extend({
  toBeValidWebhookUrl(received) {
    const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    const pass = typeof received === 'string' && webhookRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Discord webhook URL`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Discord webhook URL`,
        pass: false
      };
    }
  },
  
  toBeValidGitHubToken(received) {
    const tokenRegex = /^(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]+$/;
    const pass = typeof received === 'string' && tokenRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid GitHub token format`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid GitHub token format`,
        pass: false
      };
    }
  }
});

// Set up error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after tests
afterAll(async () => {
  // Clean up any open handles
  await new Promise(resolve => setTimeout(resolve, 100));
});