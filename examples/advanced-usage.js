// Advanced Usage Example for Discord Logger
// This example demonstrates advanced features and patterns

const { create, LoggerService, DiscordWebhookService, GitHubStorageService } = require('discord-logger');

class AdvancedExample {
  constructor() {
    // Create multiple logger instances for different purposes
    this.appLogger = create({
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_APP,
        serviceName: 'MyApp - Application',
        avatarUrl: 'https://example.com/app-avatar.png'
      },
      github: {
        token: process.env.GITHUB_TOKEN,
        owner: 'mycompany',
        repo: 'app-logs'
      }
    });

    this.errorLogger = create({
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_ERRORS,
        serviceName: 'MyApp - Errors',
        avatarUrl: 'https://example.com/error-avatar.png'
      },
      github: {
        token: process.env.GITHUB_TOKEN,
        owner: 'mycompany',
        repo: 'error-logs'
      }
    });

    this.performanceLogger = create({
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_PERFORMANCE,
        serviceName: 'MyApp - Performance',
        avatarUrl: 'https://example.com/perf-avatar.png'
      }
    });
  }

  async demonstrateAdvancedLogging() {
    console.log('🚀 Advanced Discord Logger Examples\n');

    // 1. Structured application logging
    await this.structuredLogging();
    
    // 2. Error tracking and monitoring
    await this.errorTracking();
    
    // 3. Performance monitoring
    await this.performanceMonitoring();
    
    // 4. Custom service instances
    await this.customServiceInstances();
    
    // 5. Complex data handling
    await this.complexDataHandling();
    
    // 6. Integration patterns
    await this.integrationPatterns();
    
    console.log('\n🎉 Advanced examples completed!');
  }

  async structuredLogging() {
    console.log('📊 1. Structured Application Logging');
    
    // Request logging with correlation IDs
    const requestId = `req_${Date.now()}`;
    const userContext = this.appLogger.withContext({
      requestId,
      userId: 'user_12345',
      sessionId: 'sess_67890',
      clientIP: '192.168.1.100',
      userAgent: 'MyApp/1.0.0'
    });

    await userContext.info('User authentication started');
    
    // Simulate authentication process
    const authTimer = this.appLogger.startTimer('user-auth');
    await this.simulateWork(1000);
    await authTimer.stop('User authentication completed', {
      authMethod: 'oauth2',
      provider: 'google',
      success: true
    });

    await userContext.success('User session created', null, {
      sessionDuration: '24h',
      permissions: ['read', 'write'],
      features: ['premium', 'analytics']
    });
  }

  async errorTracking() {
    console.log('🚨 2. Error Tracking and Monitoring');

    try {
      // Simulate different types of errors
      await this.simulateValidationError();
    } catch (error) {
      await this.errorLogger.error('Validation error occurred', error, {
        context: 'user-registration',
        form: 'signup',
        fieldErrors: {
          email: 'Invalid email format',
          password: 'Too weak'
        }
      });
    }

    try {
      await this.simulateDatabaseError();
    } catch (error) {
      await this.errorLogger.error('Database operation failed', error, {
        context: 'database',
        operation: 'user-create',
        retries: 3,
        lastQuery: 'INSERT INTO users (email, name) VALUES (?, ?)',
        connectionPool: {
          active: 5,
          idle: 2,
          waiting: 1
        }
      });
    }
  }

  async performanceMonitoring() {
    console.log('⚡ 3. Performance Monitoring');

    // API endpoint performance tracking
    const apiTimer = this.performanceLogger.startTimer('api-endpoint');
    
    await this.simulateWork(2500); // Simulate API work
    
    const perfResult = await apiTimer.stop('API endpoint performance', {
      endpoint: '/api/users',
      method: 'POST',
      statusCode: 201,
      responseSize: '2.1KB',
      cacheHit: false,
      dbQueries: 3,
      externalCalls: 1
    });

    // Alert on slow performance
    if (perfResult.duration > 2000) {
      await this.performanceLogger.warn('Slow API response detected', {
        duration: perfResult.duration,
        threshold: 2000,
        endpoint: '/api/users',
        recommendations: [
          'Consider adding database indexes',
          'Implement response caching',
          'Optimize query structure'
        ]
      });
    }

    // System resource monitoring
    await this.performanceLogger.info('System resources snapshot', {
      memory: this.getMemoryUsage(),
      cpu: await this.getCPUUsage(),
      activeConnections: 45,
      queueSize: 0,
      responseTime: {
        avg: '150ms',
        p95: '300ms',
        p99: '500ms'
      }
    });
  }

  async customServiceInstances() {
    console.log('🔧 4. Custom Service Instances');

    // Create standalone Discord service
    const customDiscord = new DiscordWebhookService();
    customDiscord.configure({
      webhookUrl: process.env.DISCORD_WEBHOOK_CUSTOM,
      serviceName: 'Custom Service',
      avatarUrl: 'https://example.com/custom.png'
    });

    // Create standalone GitHub service
    const customGitHub = new GitHubStorageService();
    customGitHub.configure({
      token: process.env.GITHUB_TOKEN,
      owner: 'myorg',
      repo: 'custom-logs',
      branch: 'main'
    });

    // Link them together
    customDiscord.setGitHubStorage(customGitHub);

    // Use custom services
    await customDiscord.logInfo('custom-function', 'custom-file', 'Using custom service instances', {
      customConfig: true,
      serviceType: 'standalone'
    });
  }

  async complexDataHandling() {
    console.log('📄 5. Complex Data Handling');

    // Large data object that will trigger GitHub upload
    const largeData = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        metadata: {
          createdAt: new Date().toISOString(),
          preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true
          }
        }
      })),
      analytics: {
        pageViews: 15000,
        uniqueVisitors: 3500,
        bounceRate: 0.35,
        avgSessionDuration: '4m 32s'
      },
      systemInfo: {
        version: '1.2.3',
        buildHash: 'abc123def456',
        deployedAt: new Date().toISOString(),
        environment: 'production'
      }
    };

    await this.appLogger.info('Processing large dataset', largeData, {
      operation: 'data-export',
      recordCount: 100,
      estimatedSize: '50KB'
    });
  }

  async integrationPatterns() {
    console.log('🔗 6. Integration Patterns');

    // Middleware pattern
    const requestLogger = this.createRequestLogger();
    await requestLogger('GET', '/api/users', { userId: '123' });

    // Decorator pattern
    const decoratedFunction = this.withLogging(this.businessLogic.bind(this), 'business-logic');
    await decoratedFunction({ input: 'test data' });

    // Event-driven logging
    await this.eventDrivenLogging();
  }

  createRequestLogger() {
    return async (method, path, data) => {
      const requestId = `req_${Date.now()}`;
      const logger = this.appLogger.withContext({ requestId, method, path });
      
      await logger.info('Request started', { method, path });
      
      const timer = this.performanceLogger.startTimer('request-processing');
      
      try {
        await this.simulateWork(Math.random() * 1000);
        
        await timer.stop('Request completed successfully', {
          statusCode: 200,
          responseSize: '1.2KB'
        });
        
        await logger.success('Request processed successfully', data, {
          statusCode: 200,
          processingTime: timer.duration
        });
      } catch (error) {
        await logger.error('Request processing failed', error, data);
        throw error;
      }
    };
  }

  withLogging(fn, operationName) {
    return async (...args) => {
      const timer = this.appLogger.startTimer(operationName);
      const logger = this.appLogger.withContext({ operation: operationName });
      
      try {
        await logger.debug('Operation started', { args });
        const result = await fn(...args);
        
        await timer.stop('Operation completed', result);
        return result;
      } catch (error) {
        await logger.error('Operation failed', error, { args });
        throw error;
      }
    };
  }

  async eventDrivenLogging() {
    // Simulate event-driven architecture
    const events = [
      { type: 'USER_REGISTERED', data: { userId: '123', email: 'user@example.com' } },
      { type: 'ORDER_PLACED', data: { orderId: '456', amount: 99.99 } },
      { type: 'PAYMENT_PROCESSED', data: { paymentId: '789', status: 'success' } }
    ];

    for (const event of events) {
      await this.appLogger.info(`Event: ${event.type}`, event.data, {
        eventType: event.type,
        timestamp: new Date().toISOString(),
        source: 'event-bus'
      });
    }
  }

  // Utility methods
  async businessLogic(input) {
    await this.simulateWork(500);
    return { processed: true, input, timestamp: new Date().toISOString() };
  }

  async simulateWork(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async simulateValidationError() {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.details = {
      field: 'email',
      message: 'Invalid email format',
      value: 'invalid-email'
    };
    throw error;
  }

  async simulateDatabaseError() {
    const error = new Error('Connection timeout');
    error.name = 'DatabaseError';
    error.code = 'CONNECTION_TIMEOUT';
    error.details = {
      host: 'db.example.com',
      port: 5432,
      timeout: 5000
    };
    throw error;
  }

  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`
      };
    }
    return { status: 'unavailable' };
  }

  async getCPUUsage() {
    // Simplified CPU usage simulation
    return {
      percent: Math.round(Math.random() * 100),
      loadAverage: [0.5, 0.7, 0.8]
    };
  }
}

// Run examples
async function runAdvancedExamples() {
  const example = new AdvancedExample();
  await example.demonstrateAdvancedLogging();
}

// Export for use in other modules
module.exports = {
  AdvancedExample,
  runAdvancedExamples
};

// Run if executed directly
if (require.main === module) {
  runAdvancedExamples().catch(console.error);
}