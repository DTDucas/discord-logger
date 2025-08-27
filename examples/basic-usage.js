// Basic Usage Example for Discord Logger
// This example demonstrates the basic functionality of the discord-logger package

const logger = require('discord-logger');

async function basicUsageExample() {
  console.log('🚀 Discord Logger - Basic Usage Example');
  
  try {
    // Configure the logger
    logger.configure({
      discordWebhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
      // GitHub configuration is optional for large content storage
      github: {
        token: 'ghp_your_github_token_here',
        owner: 'your-github-username',    // Required if using GitHub
        repo: 'your-logs-repository'      // Required if using GitHub
      }
    });

    // Basic logging methods
    console.log('📋 Testing basic logging methods...');
    
    await logger.info('Application started successfully', {
      environment: 'development',
      version: '1.0.0'
    });

    await logger.warn('This is a warning message', {
      memoryUsage: '85%',
      threshold: '80%'
    });

    await logger.success('Task completed successfully', 
      { userId: 123, taskId: 'task_456' }, 
      { status: 'completed', duration: '2.5s' }
    );

    // Error logging with Error object
    try {
      throw new Error('Something went wrong!');
    } catch (error) {
      await logger.error('An error occurred', error, {
        context: 'user-registration',
        userId: 123
      });
    }

    await logger.debug('Debug information', {
      variables: { x: 10, y: 20 },
      state: 'active'
    });

    console.log('✅ Basic logging completed!');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error.message);
  }
}

async function timerExample() {
  console.log('⏱️ Testing timer functionality...');
  
  const timer = logger.startTimer('data-processing');
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const result = await timer.stop('Data processing completed', {
    recordsProcessed: 1000,
    errorsFound: 0
  });
  
  console.log(`Timer result: ${result.duration}ms for ${result.label}`);
}

async function contextExample() {
  console.log('🔗 Testing context logging...');
  
  const requestLogger = logger.withContext({
    requestId: 'req_12345',
    userId: 'user_789',
    endpoint: '/api/users'
  });
  
  await requestLogger.info('Request started');
  await requestLogger.debug('Validating input data', { payload: { name: 'John' } });
  await requestLogger.success('Request completed', null, { statusCode: 200 });
}

async function batchExample() {
  console.log('📦 Testing batch logging...');
  
  const logs = [
    { level: 'INFO', message: 'Batch item 1', data: { id: 1 } },
    { level: 'WARN', message: 'Batch item 2', data: { id: 2 } },
    { level: 'SUCCESS', message: 'Batch item 3', data: { id: 3 } }
  ];
  
  await logger.batch(logs, { batchId: 'batch_001', source: 'cron-job' });
}

async function healthCheckExample() {
  console.log('🏥 Testing health check...');
  
  const health = await logger.healthCheck();
  console.log('Health check result:', JSON.stringify(health, null, 2));
}

// Run all examples
async function runAllExamples() {
  console.log('🎯 Running Discord Logger Examples\n');
  
  await basicUsageExample();
  console.log('');
  
  await timerExample();
  console.log('');
  
  await contextExample();
  console.log('');
  
  await batchExample();
  console.log('');
  
  await healthCheckExample();
  
  console.log('\n🎉 All examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  basicUsageExample,
  timerExample,
  contextExample,
  batchExample,
  healthCheckExample,
  runAllExamples
};