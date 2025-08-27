module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns - exclude browser tests
  testMatch: [
    '**/test/**/*.test.js',
    '!**/test/browser/**',
    '**/__tests__/**/*.js'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 30000,

  // Module resolution
  moduleFileExtensions: ['js', 'json'],
  moduleDirectories: ['node_modules', 'src'],

  // Transform configuration for ES modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Global variables for tests
  globals: {
    'NODE_ENV': 'test'
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',

  // Error handling
  errorOnDeprecated: true,
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ]
};