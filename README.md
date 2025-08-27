# Discord Logger

A powerful Discord webhook logger with GitHub file storage for large content. Works seamlessly in both Node.js and browser environments.

[![npm version](https://badge.fury.io/js/discord-logger.svg)](https://badge.fury.io/js/discord-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/DTDucas/discord-logger/workflows/Node.js%20CI/badge.svg)](https://github.com/DTDucas/discord-logger/actions)

## Features

- 🚀 **Universal**: Works in Node.js and browsers
- 📨 **Discord Integration**: Send structured logs to Discord channels via webhooks
- 📁 **GitHub Storage**: Automatically upload large content to GitHub for easy access
- ⚡ **Rate Limited**: Built-in rate limiting and retry logic
- 🎯 **Context Logging**: Support for request correlation and context tracking
- ⏱️ **Performance Timing**: Built-in timer functionality
- 📦 **Batch Processing**: Send multiple logs efficiently
- 🔧 **TypeScript Support**: Full TypeScript definitions included
- 🛡️ **Error Handling**: Robust error handling and fallbacks

## Installation

```bash
npm install discord-logger
```

## Quick Start

### Node.js

```javascript
const logger = require('discord-logger');

// Configure the logger
logger.configure({
  discordWebhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
  githubToken: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Optional
});

// Basic logging
await logger.info('Application started', { version: '1.0.0' });
await logger.error('Something went wrong', error, { context: 'startup' });
await logger.success('Task completed', data, response);
```

### Browser

```html
<script src="https://unpkg.com/discord-logger/dist/discord-logger.min.js"></script>
<script>
  const logger = DiscordLogger.create({
    discordWebhookUrl: 'YOUR_WEBHOOK_URL'
  });
  
  logger.info('Hello from browser!', { userAgent: navigator.userAgent });
</script>
```

### ES Modules

```javascript
import logger, { create } from 'discord-logger';

// Use default instance
await logger.info('ES Module logging works!');

// Or create custom instance
const customLogger = create({ 
  discordWebhookUrl: 'YOUR_WEBHOOK_URL' 
});
```

## Configuration

### Basic Configuration

```javascript
logger.configure({
  discordWebhookUrl: 'https://discord.com/api/webhooks/ID/TOKEN',
  githubToken: 'ghp_your_token_here' // Optional: for large content storage
});
```

### Advanced Configuration

```javascript
const logger = require('discord-logger').create({
  discord: {
    webhookUrl: 'https://discord.com/api/webhooks/ID/TOKEN',
    serviceName: 'My Application',
    avatarUrl: 'https://example.com/avatar.png'
  },
  github: {
    token: 'ghp_your_token_here',
    owner: 'your-username',        // Required
    repo: 'logs-repository',       // Required
    branch: 'main'
  }
});
```

## Usage Examples

### Basic Logging Methods

```javascript
// Info logging
await logger.info('User logged in', { 
  userId: 123, 
  email: 'user@example.com' 
});

// Warning
await logger.warn('High memory usage detected', { 
  usage: '85%',
  threshold: '80%' 
});

// Error with Error object
try {
  throw new Error('Database connection failed');
} catch (error) {
  await logger.error('Database error', error, { 
    context: 'user-registration' 
  });
}

// Success with response data
await logger.success('Payment processed', 
  { orderId: '12345' }, 
  { transactionId: 'tx_67890', amount: 99.99 }
);

// Debug information
await logger.debug('Processing step completed', { 
  step: 3, 
  totalSteps: 10 
});
```

### Performance Timing

```javascript
// Start a timer
const timer = logger.startTimer('data-processing');

// Do some work
await processLargeDataset();

// Stop timer and log result
const result = await timer.stop('Data processing completed', {
  recordsProcessed: 10000,
  errors: 0
});

console.log(`Processing took ${result.duration}ms`);
```

### Context Logging

```javascript
// Create a context logger for request tracking
const requestLogger = logger.withContext({
  requestId: 'req_12345',
  userId: 'user_67890',
  endpoint: '/api/users'
});

await requestLogger.info('Request started');
await requestLogger.debug('Validating input', { payload });
await requestLogger.success('Request completed', null, { statusCode: 200 });
```

### Batch Logging

```javascript
const logs = [
  { level: 'info', message: 'Batch item 1', data: { id: 1 } },
  { level: 'warn', message: 'Batch item 2', data: { id: 2 } },
  { level: 'success', message: 'Batch item 3', data: { id: 3 } }
];

await logger.batch(logs, { 
  batchId: 'batch_001', 
  source: 'cron-job' 
});
```

### Custom Notifications

```javascript
await logger.sendNotification({
  title: '🚀 Deployment Complete',
  description: 'Application deployed successfully to production',
  fields: [
    { name: 'Version', value: '1.2.0', inline: true },
    { name: 'Environment', value: 'Production', inline: true },
    { name: 'Deploy Time', value: '2 minutes', inline: true }
  ],
  color: 0x00ff00
});
```

### Health Monitoring

```javascript
const health = await logger.healthCheck();
console.log('Discord Status:', health.discord.status);
console.log('GitHub Status:', health.github.status);
console.log('Overall Status:', health.overall.status);
```

## Large Content Handling

⚠️ **Important**: GitHub storage requires you to configure your own repository. The library will **not** use any default repository.

The logger automatically handles large content by uploading it to GitHub when it exceeds Discord's limits:

```javascript
// First configure GitHub storage with YOUR repository
logger.configure({
  github: {
    token: 'your_github_token',
    owner: 'your-username',        // Required
    repo: 'your-logs-repo'         // Required
  }
});

const largeData = {
  users: Array.from({length: 1000}, (_, i) => ({
    id: i,
    name: `User ${i}`,
    // ... more data
  }))
};

// This will automatically upload to YOUR GitHub repo and link in Discord
await logger.info('Processing large dataset', largeData);
```

## Advanced Usage

### Multiple Logger Instances

```javascript
const { create } = require('discord-logger');

// Application logger
const appLogger = create({
  discord: { 
    webhookUrl: process.env.DISCORD_APP_WEBHOOK,
    serviceName: 'MyApp - Application' 
  }
});

// Error logger
const errorLogger = create({
  discord: { 
    webhookUrl: process.env.DISCORD_ERROR_WEBHOOK,
    serviceName: 'MyApp - Errors' 
  }
});

await appLogger.info('App started');
await errorLogger.error('Critical error occurred', error);
```

### Custom Service Integration

```javascript
const { DiscordWebhookService, GitHubStorageService } = require('discord-logger');

// Create custom services
const discord = new DiscordWebhookService();
const github = new GitHubStorageService();

// Configure individually
discord.configure({ webhookUrl: 'YOUR_WEBHOOK' });
github.configure({ token: 'YOUR_TOKEN' });

// Link services
discord.setGitHubStorage(github);

// Use directly
await discord.logInfo('function-name', 'file-name', 'Custom message');
```

## Browser Compatibility

The library works in modern browsers and includes polyfills for:
- `Buffer` operations (using base64 encoding)
- Stack trace parsing (simplified for browser environment)
- Environment detection

### Browser Bundle

```html
<!-- Use CDN -->
<script src="https://unpkg.com/discord-logger/dist/discord-logger.min.js"></script>

<!-- Or self-host -->
<script src="/path/to/discord-logger.min.js"></script>

<script>
  const logger = DiscordLogger.create({
    discordWebhookUrl: 'YOUR_WEBHOOK_URL'
  });
  
  // Use as normal
  logger.info('Browser logging works!');
</script>
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import logger, { LoggerService, LogOptions } from 'discord-logger';

const customLogger: LoggerService = logger.create({
  discordWebhookUrl: process.env.DISCORD_WEBHOOK!
});

const logOptions: LogOptions = {
  level: 'INFO',
  message: 'Typed logging',
  data: { key: 'value' },
  metadata: { timestamp: new Date().toISOString() }
};

await customLogger.log(logOptions);
```

## Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `discordWebhookUrl` | string | Discord webhook URL | - |
| `githubToken` | string | GitHub personal access token | - |
| `discord.serviceName` | string | Service name shown in Discord | 'Discord Logger' |
| `discord.avatarUrl` | string | Avatar URL for Discord messages | Default Discord avatar |
| `discord.footerText` | string | Custom footer text | 'Discord Logger • Cross-Platform' |
| `discord.colors.*` | number | Custom colors for log levels | Default Discord colors |
| `discord.rateLimit.minInterval` | number | Min time between requests (ms) | 500 |
| `discord.rateLimit.maxRetries` | number | Max retry attempts | 3 |
| `github.owner` | string | GitHub repository owner | **Required** |
| `github.repo` | string | GitHub repository name | **Required** |
| `github.branch` | string | GitHub branch | 'main' |
| `github.contentThreshold` | number | Chars before GitHub upload | 1800 |
| `github.folderFormat` | string | Date folder format | 'YYYY-MM-DD' |
| `github.maxFileSize` | number | Maximum file size (bytes) | 25MB |

## Error Handling

The library includes comprehensive error handling:

```javascript
// Configure with invalid webhook
logger.configure({ discordWebhookUrl: 'invalid-url' });

const result = await logger.info('Test message');
if (!result.success) {
  console.error('Logging failed:', result.error);
}

// Health check before critical operations
const health = await logger.healthCheck();
if (health.overall.status !== 'healthy') {
  console.warn('Logger services may be degraded');
}
```

## Rate Limiting

Built-in rate limiting prevents Discord API abuse:
- Automatic queue management
- Exponential backoff on rate limits
- Configurable retry attempts
- Graceful degradation

## Security Considerations

- Never commit webhook URLs or tokens to version control
- Use environment variables for sensitive configuration
- Validate webhook URLs and tokens before use
- Consider rate limiting in high-traffic applications

## Examples

Check out the `/examples` directory for complete examples:
- `basic-usage.js` - Basic logging patterns
- `advanced-usage.js` - Advanced features and patterns
- `browser-usage.html` - Browser implementation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Duong Tran Quang DTDucas**
- Email: baymax.contact@gmail.com
- GitHub: [@DTDucas](https://github.com/DTDucas)

## Support

- 📫 [Create an issue](https://github.com/DTDucas/discord-logger/issues) for bug reports
- 💡 [Request features](https://github.com/DTDucas/discord-logger/issues) for new functionality
- 📖 [Read the docs](https://github.com/DTDucas/discord-logger#readme) for detailed information

---

<p align="center">Made with ❤️ by DTDucas</p>