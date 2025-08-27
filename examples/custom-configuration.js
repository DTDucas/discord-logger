// Custom Configuration Example for Discord Logger
// This example demonstrates how to customize all configurable options

const { create, LoggerService } = require('discord-logger');

// Example 1: Custom Discord Configuration
async function customDiscordConfig() {
  console.log('📱 Custom Discord Configuration Example');
  
  const logger = create({
    discord: {
      webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
      serviceName: 'My Custom App',
      avatarUrl: 'https://example.com/my-custom-avatar.png',
      
      // Custom footer
      footerText: 'My Custom Logger • v2.0',
      footerIconUrl: 'https://example.com/my-icon.png',
      
      // Custom colors (decimal values)
      colors: {
        ERROR: 16711680,    // Bright red
        WARN: 16753920,     // Orange
        INFO: 65535,        // Cyan
        DEBUG: 16777215,    // White
        SUCCESS: 65280      // Lime green
      },
      
      // Custom icons/emojis
      icons: {
        ERROR: '💥',
        WARN: '🔸',
        INFO: '💡',
        DEBUG: '🔬',
        SUCCESS: '🎉'
      },
      
      // Custom service icons (URLs)
      serviceIcons: {
        ERROR: 'https://example.com/error-icon.png',
        WARN: 'https://example.com/warn-icon.png',
        INFO: 'https://example.com/info-icon.png',
        DEBUG: 'https://example.com/debug-icon.png',
        SUCCESS: 'https://example.com/success-icon.png'
      },
      
      // Rate limiting configuration
      rateLimit: {
        minInterval: 1000,        // 1 second between requests
        maxRetries: 5,            // Retry up to 5 times
        retryBackoff: 'exponential', // or 'fixed'
        retryMultiplier: 3        // 3x backoff multiplier
      },
      
      // Discord API limits (don't change unless you know what you're doing)
      limits: {
        embedDescription: 3000,   // Custom description limit
        fieldValue: 800          // Custom field value limit
      }
    }
  });
  
  await logger.info('Testing custom Discord configuration', {
    customColors: true,
    customIcons: true,
    customFooter: true
  });
  
  await logger.success('Configuration test completed!', {
    features: ['custom colors', 'custom icons', 'custom rate limiting']
  });
}

// Example 2: Custom GitHub Configuration
async function customGitHubConfig() {
  console.log('📁 Custom GitHub Configuration Example');
  
  const logger = create({
    github: {
      token: 'ghp_your_github_token_here',
      owner: 'your-organization',        // Required - specify your GitHub username/org
      repo: 'custom-logs-repo',          // Required - specify your repository name
      branch: 'logging',
      
      // Custom API endpoints (for GitHub Enterprise)
      apiUrl: 'https://api.github.com',  // or your enterprise URL
      rawUrl: 'https://raw.githubusercontent.com',
      
      // File size and content limits
      maxFileSize: 10 * 1024 * 1024,     // 10MB limit
      contentThreshold: 2500,             // Upload to GitHub after 2500 chars
      
      // File organization
      useTimestampFolders: true,          // Enable date-based folders
      folderFormat: 'YYYY/MM/DD',         // Nested folder structure
      fileExtension: 'txt',               // Use .txt instead of .json
      
      // Custom commit message
      commitMessageTemplate: '[LOGGER] {filename} - {timestamp}',
      
      // Request timeout
      requestTimeout: 45000               // 45 seconds
    }
  });
  
  // This will be uploaded to GitHub due to size
  const largeData = {
    message: 'Testing custom GitHub configuration',
    data: Array.from({ length: 200 }, (_, i) => ({
      id: i,
      name: `Test Item ${i}`,
      description: 'This is a test item with custom GitHub configuration.',
      metadata: {
        created: new Date().toISOString(),
        category: 'test',
        priority: i % 5
      }
    }))
  };
  
  await logger.info('Large dataset processed', largeData, {
    configTest: 'custom-github',
    uploadExpected: true
  });
}

// Example 3: Combined Custom Configuration
async function combinedCustomConfig() {
  console.log('🔧 Combined Custom Configuration Example');
  
  const logger = create({
    discord: {
      webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
      serviceName: 'Production Monitor',
      avatarUrl: 'https://example.com/prod-avatar.png',
      footerText: 'Production Monitoring • Status Dashboard',
      
      // Production-friendly colors
      colors: {
        ERROR: 15548997,    // Dark red
        WARN: 16776960,     // Yellow
        INFO: 5793266,      // Dark blue
        DEBUG: 10181046,    // Purple
        SUCCESS: 3066993    // Dark green
      },
      
      // Professional icons
      icons: {
        ERROR: '🔴',
        WARN: '🟡',
        INFO: '🔵',
        DEBUG: '🟣',
        SUCCESS: '🟢'
      },
      
      rateLimit: {
        minInterval: 2000,  // Slower for production
        maxRetries: 3
      }
    },
    
    github: {
      token: 'ghp_production_token_here',
      owner: 'your-company',             // Required - your company GitHub org
      repo: 'production-logs',           // Required - your logs repository
      branch: 'main',
      contentThreshold: 1000,    // Upload smaller content for production
      folderFormat: 'YYYY-MM',   // Monthly folders
      commitMessageTemplate: '[PROD-LOG] {directory}/{filename}',
      useTimestampFolders: true
    }
  });
  
  // Production-style logging
  await logger.info('Production system started', {
    environment: 'production',
    version: '2.1.0',
    uptime: process.uptime()
  });
  
  await logger.warn('High memory usage detected', {
    memoryUsage: '85%',
    threshold: '80%',
    recommendation: 'Consider scaling up'
  });
  
  await logger.success('Health check passed', {
    services: ['database', 'cache', 'api'],
    responseTime: '120ms',
    status: 'all_green'
  });
}

// Example 4: Enterprise GitHub Configuration
async function enterpriseGitHubConfig() {
  console.log('🏢 Enterprise GitHub Configuration Example');
  
  const logger = create({
    github: {
      token: 'ghp_enterprise_token',
      owner: 'your-enterprise-org',      // Required - your enterprise GitHub org
      repo: 'audit-logs',                // Required - your audit logs repository
      branch: 'audit',
      
      // Enterprise GitHub URLs
      apiUrl: 'https://github.enterprise.com/api/v3',
      rawUrl: 'https://raw.github.enterprise.com',
      
      // Enterprise settings
      maxFileSize: 50 * 1024 * 1024,      // 50MB for enterprise
      contentThreshold: 5000,              // Higher threshold
      folderFormat: 'YYYY-MM-DD',          // Daily folders
      fileExtension: 'log',                // .log files
      
      commitMessageTemplate: '[AUDIT] {timestamp} - {directory}/{filename}',
      requestTimeout: 60000                // 1 minute timeout
    }
  });
  
  await logger.info('Enterprise audit log', {
    event: 'user_login',
    userId: 'emp_12345',
    ipAddress: '192.168.1.100',
    userAgent: 'Enterprise Browser v1.0',
    timestamp: new Date().toISOString(),
    compliance: {
      regulation: 'SOX',
      retention: '7 years',
      classification: 'confidential'
    }
  });
}

// Example 5: Minimal Configuration
async function minimalConfig() {
  console.log('⚡ Minimal Configuration Example');
  
  // Just the essentials
  const logger = create({
    discord: {
      webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN'
    }
    // GitHub is optional - will work without it
  });
  
  await logger.info('Simple logging without GitHub storage');
  await logger.error('Error without complex configuration', new Error('Simple error'));
}

// Example 6: Dynamic Configuration
async function dynamicConfig() {
  console.log('🔄 Dynamic Configuration Example');
  
  const logger = new LoggerService();
  
  // Configure step by step
  logger.configure({
    discord: {
      webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
      serviceName: 'Dynamic Logger'
    }
  });
  
  // Update configuration later
  logger.discord.configure({
    colors: { INFO: 65535 }, // Change INFO color to cyan
    footerText: 'Updated Footer Text'
  });
  
  logger.github.configure({
    owner: 'your-username',            // Required - specify your GitHub username
    repo: 'your-logs-repo',            // Required - specify your repository
    contentThreshold: 3000
  });
  
  await logger.info('Configuration updated dynamically', {
    previousConfig: 'basic',
    newConfig: 'enhanced',
    updateTime: new Date().toISOString()
  });
}

// Run all examples
async function runCustomConfigExamples() {
  console.log('🎨 Discord Logger - Custom Configuration Examples\n');
  
  try {
    await customDiscordConfig();
    console.log('');
    
    await customGitHubConfig();
    console.log('');
    
    await combinedCustomConfig();
    console.log('');
    
    await enterpriseGitHubConfig();
    console.log('');
    
    await minimalConfig();
    console.log('');
    
    await dynamicConfig();
    
    console.log('\n🎉 All custom configuration examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// Configuration presets
const PRESETS = {
  development: {
    discord: {
      serviceName: 'Dev Environment',
      colors: { INFO: 65535, SUCCESS: 65280 }, // Bright colors
      rateLimit: { minInterval: 100 } // Fast for dev
    },
    github: {
      contentThreshold: 3000,
      folderFormat: 'YYYY-MM-DD',
      useTimestampFolders: true
    }
  },
  
  production: {
    discord: {
      serviceName: 'Production',
      colors: { ERROR: 15548997, WARN: 16776960 }, // Professional colors
      rateLimit: { minInterval: 2000, maxRetries: 5 } // Conservative for prod
    },
    github: {
      contentThreshold: 1000, // Upload more to GitHub in prod
      folderFormat: 'YYYY/MM/DD',
      commitMessageTemplate: '[PROD] {timestamp} - {filename}'
    }
  },
  
  testing: {
    discord: {
      serviceName: 'Test Suite',
      colors: { DEBUG: 16777215, INFO: 10181046 },
      rateLimit: { minInterval: 50 } // Fast for testing
    },
    github: {
      contentThreshold: 5000, // Less uploads during testing
      folderFormat: 'YYYY-MM',
      useTimestampFolders: false
    }
  }
};

// Export presets and examples
module.exports = {
  PRESETS,
  customDiscordConfig,
  customGitHubConfig,
  combinedCustomConfig,
  enterpriseGitHubConfig,
  minimalConfig,
  dynamicConfig,
  runCustomConfigExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runCustomConfigExamples().catch(console.error);
}