// Universal imports - works in both Node.js and browsers
const axios = (typeof require !== 'undefined') ? require('axios') : window.axios;
const Helpers = (typeof require !== 'undefined') ? require('../utils/helpers') : window.DiscordLogger?.Helpers;

class DiscordWebhookService {
  constructor(config = {}) {
    // Core configuration
    this.webhookUrl = config.webhookUrl || null;
    this.serviceName = config.serviceName || 'Logger Service';
    this.avatarUrl = config.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';

    // Discord API limits - configurable with safe defaults
    this.limits = {
      username: config.limits?.username || 80,
      content: config.limits?.content || 2000,
      embedTitle: config.limits?.embedTitle || 256,
      embedDescription: config.limits?.embedDescription || 4096,
      fieldName: config.limits?.fieldName || 256,
      fieldValue: config.limits?.fieldValue || 1024,
      footerText: config.limits?.footerText || 2048,
      totalCharacters: config.limits?.totalCharacters || 6000,
      maxEmbeds: config.limits?.maxEmbeds || 10,
      maxFields: config.limits?.maxFields || 25,
      ...config.limits
    };

    // Rate limiting configuration
    this.minInterval = config.rateLimit?.minInterval || 500; // ms between requests
    this.maxRetries = config.rateLimit?.maxRetries || 3;
    this.retryBackoff = config.rateLimit?.retryBackoff || 'exponential'; // 'exponential' or 'fixed'
    this.retryMultiplier = config.rateLimit?.retryMultiplier || 2;

    // Footer configuration
    this.footerText = config.footerText || 'Discord Logger • Cross-Platform';
    this.footerIconUrl = config.footerIconUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

    // Color scheme configuration
    this.colors = {
      ERROR: config.colors?.ERROR || 15158332, // Red
      WARN: config.colors?.WARN || 16776960,   // Yellow
      INFO: config.colors?.INFO || 3447003,    // Blue
      DEBUG: config.colors?.DEBUG || 9807270,  // Purple
      SUCCESS: config.colors?.SUCCESS || 5763719, // Green
      ...config.colors
    };

    // Icon configuration
    this.icons = {
      ERROR: config.icons?.ERROR || '🚨',
      WARN: config.icons?.WARN || '⚠️',
      INFO: config.icons?.INFO || '📋',
      DEBUG: config.icons?.DEBUG || '🔍',
      SUCCESS: config.icons?.SUCCESS || '✅',
      ...config.icons
    };

    // Service icons configuration
    this.serviceIcons = {
      ERROR: config.serviceIcons?.ERROR || 'https://cdn-icons-png.flaticon.com/512/753/753345.png',
      WARN: config.serviceIcons?.WARN || 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
      INFO: config.serviceIcons?.INFO || 'https://cdn-icons-png.flaticon.com/512/1827/1827933.png',
      DEBUG: config.serviceIcons?.DEBUG || 'https://cdn-icons-png.flaticon.com/512/2103/2103832.png',
      SUCCESS: config.serviceIcons?.SUCCESS || 'https://cdn-icons-png.flaticon.com/512/845/845646.png',
      ...config.serviceIcons
    };

    // Internal state
    this.rateLimitQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
    this.githubStorage = null;
  }

  setWebhookUrl(url) {
    if (!Helpers.validateWebhookUrl(url)) {
      throw new Error('Invalid Discord webhook URL format');
    }
    this.webhookUrl = url;
  }

  setGitHubStorage(githubStorage) {
    this.githubStorage = githubStorage;
  }

  configure(options = {}) {
    if (options.webhookUrl) this.setWebhookUrl(options.webhookUrl);
    if (options.serviceName) this.serviceName = options.serviceName;
    if (options.avatarUrl) this.avatarUrl = options.avatarUrl;
    if (options.githubStorage) this.setGitHubStorage(options.githubStorage);

    // Update configurable properties
    if (options.footerText) this.footerText = options.footerText;
    if (options.footerIconUrl) this.footerIconUrl = options.footerIconUrl;

    // Update rate limiting config
    if (options.rateLimit) {
      if (options.rateLimit.minInterval) this.minInterval = options.rateLimit.minInterval;
      if (options.rateLimit.maxRetries) this.maxRetries = options.rateLimit.maxRetries;
      if (options.rateLimit.retryBackoff) this.retryBackoff = options.rateLimit.retryBackoff;
      if (options.rateLimit.retryMultiplier) this.retryMultiplier = options.rateLimit.retryMultiplier;
    }

    // Update colors, icons, and limits
    if (options.colors) this.colors = { ...this.colors, ...options.colors };
    if (options.icons) this.icons = { ...this.icons, ...options.icons };
    if (options.serviceIcons) this.serviceIcons = { ...this.serviceIcons, ...options.serviceIcons };
    if (options.limits) this.limits = { ...this.limits, ...options.limits };
  }

  async log(options) {
    const {
      level = 'INFO',
      functionName = 'unknown',
      fileName = 'unknown',
      message = 'No message provided',
      data = null,
      error = null,
      response = null,
      metadata = {}
    } = options;

    return new Promise((resolve) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        functionName,
        fileName,
        message,
        data,
        error,
        response,
        metadata,
        resolve
      };

      this.rateLimitQueue.push(logEntry);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.rateLimitQueue.length > 0) {
      const logEntry = this.rateLimitQueue.shift();
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minInterval) {
        await Helpers.sleep(this.minInterval - timeSinceLastRequest);
      }

      try {
        const result = await this.sendWithRetry(logEntry);
        logEntry.resolve({ success: true, result });
      } catch (error) {
        logEntry.resolve({ success: false, error: error.message });
      }

      this.lastRequestTime = Date.now();
    }

    this.isProcessingQueue = false;
  }

  async sendWithRetry(logEntry, retryCount = 0) {
    try {
      const payload = await this.createPayload(logEntry);

      if (!this.webhookUrl) {
        return { disabled: true, message: 'Webhook URL not configured' };
      }

      const response = await axios.post(this.webhookUrl, payload, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < this.maxRetries) {
        const retryAfter = error.response.headers['retry-after']
          ? parseInt(error.response.headers['retry-after']) * 1000
          : Math.pow(2, retryCount) * 1000;

        await Helpers.sleep(retryAfter + Math.random() * 1000);
        return this.sendWithRetry(logEntry, retryCount + 1);
      }

      if ((error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') && retryCount < this.maxRetries) {
        const backoff = Math.pow(2, retryCount) * 1000;
        await Helpers.sleep(backoff);
        return this.sendWithRetry(logEntry, retryCount + 1);
      }

      throw error;
    }
  }

  async createPayload(logEntry) {
    const embed = await this.createEmbed(logEntry);
    return {
      username: Helpers.truncateText(this.serviceName, this.limits.username),
      avatar_url: this.avatarUrl,
      embeds: [embed],
      allowed_mentions: { parse: [] }
    };
  }

  async createEmbed(logEntry) {
    const color = this.getColorByLevel(logEntry.level);
    const icon = this.getIconByLevel(logEntry.level);

    const embed = {
      author: {
        name: `${logEntry.fileName}`,
        icon_url: this.getServiceIcon(logEntry.level)
      },
      title: Helpers.truncateText(`${icon} ${logEntry.level} - ${logEntry.functionName}()`, this.limits.embedTitle),
      description: Helpers.truncateText(logEntry.message, this.limits.embedDescription),
      color: color,
      timestamp: logEntry.timestamp,
      footer: {
        text: this.footerText,
        icon_url: this.footerIconUrl
      },
      fields: []
    };

    // Add metadata field
    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      const metadataContent = await this.processContentField(
        logEntry.metadata,
        logEntry.functionName,
        logEntry.fileName,
        'metadata'
      );

      embed.fields.push({
        name: '📋 Metadata',
        value: Helpers.truncateText(metadataContent.text, this.limits.fieldValue),
        inline: false
      });
    }

    // Add data field
    if (logEntry.data !== null && logEntry.data !== undefined) {
      const dataContent = await this.processContentField(
        logEntry.data,
        logEntry.functionName,
        logEntry.fileName,
        'data'
      );

      embed.fields.push({
        name: dataContent.inline ? '📊 Data' : '📊 Data (GitHub)',
        value: Helpers.truncateText(dataContent.text, this.limits.fieldValue),
        inline: false
      });
    }

    // Add response field
    if (logEntry.response !== null && logEntry.response !== undefined) {
      const responseContent = await this.processContentField(
        logEntry.response,
        logEntry.functionName,
        logEntry.fileName,
        'response'
      );

      embed.fields.push({
        name: responseContent.inline ? '📤 Response' : '📤 Response (GitHub)',
        value: Helpers.truncateText(responseContent.text, this.limits.fieldValue),
        inline: false
      });
    }

    // Add error field
    if (logEntry.error !== null && logEntry.error !== undefined) {
      const errorContent = await this.processError(
        logEntry.error,
        logEntry.functionName,
        logEntry.fileName
      );

      embed.fields.push({
        name: errorContent.inline ? '❌ Error' : '❌ Error (GitHub)',
        value: Helpers.truncateText(errorContent.text, this.limits.fieldValue),
        inline: false
      });
    }

    // Add environment info for errors and warnings
    if (logEntry.level === 'ERROR' || logEntry.level === 'WARN') {
      const env = Helpers.processEnvironment();
      let envText = `**Platform:** ${env.platform}`;

      if (Helpers.isNode()) {
        envText += `\n**Node:** ${env.nodeVersion}\n**Memory:** ${env.memory}MB\n**Uptime:** ${env.uptime}s`;
      } else {
        envText += `\n**Memory:** ${env.memory}MB\n**Uptime:** ${env.uptime}s`;
      }

      embed.fields.push({
        name: '🔧 Environment',
        value: envText,
        inline: true
      });
    }

    return embed;
  }

  async processContentField(content, functionName, fileName, type) {
    if (this.githubStorage) {
      return await this.githubStorage.processContentForDiscord(content, functionName, fileName, type);
    }

    // Fallback without GitHub storage
    const textContent = typeof content === 'object'
      ? JSON.stringify(content, null, 2)
      : String(content);

    if (textContent.length <= 1000) {
      if (typeof content === 'object') {
        return {
          inline: true,
          text: `\`\`\`json\n${textContent}\n\`\`\``,
          length: textContent.length
        };
      } else {
        return {
          inline: true,
          text: Helpers.sanitizeForDiscord(textContent),
          length: textContent.length
        };
      }
    } else {
      return {
        inline: true,
        text: `Content too large (${Helpers.formatFileSize(textContent.length)}) - GitHub storage not configured`,
        length: textContent.length
      };
    }
  }

  async processError(error, functionName, fileName) {
    let errorData;

    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
    } else if (typeof error === 'object') {
      errorData = error;
    } else {
      errorData = { message: String(error) };
    }

    return await this.processContentField(errorData, functionName, fileName, 'error');
  }

  getColorByLevel(level) {
    return this.colors[level] || this.colors['INFO'];
  }

  getIconByLevel(level) {
    return this.icons[level] || '📝';
  }

  getServiceIcon(level) {
    return this.serviceIcons[level] || null;
  }

  async sendNotification(data) {
    const {
      title = '🔄 System Notification',
      description = '',
      fields = [],
      color = 5814783,
      username = this.serviceName,
      avatarUrl = this.avatarUrl
    } = data;

    const embed = {
      title: Helpers.truncateText(title, this.limits.embedTitle),
      description: Helpers.truncateText(description, this.limits.embedDescription),
      color,
      fields: fields.map(field => ({
        name: Helpers.truncateText(field.name, this.limits.fieldName),
        value: Helpers.truncateText(field.value, this.limits.fieldValue),
        inline: field.inline || false
      })),
      timestamp: new Date().toISOString(),
      footer: {
        text: this.footerText,
        icon_url: this.footerIconUrl
      }
    };

    const payload = {
      username: Helpers.truncateText(username, this.limits.username),
      avatar_url: avatarUrl,
      embeds: [embed]
    };

    if (!this.webhookUrl) {
      return { disabled: true, message: 'Webhook URL not configured' };
    }

    const response = await axios.post(this.webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }

  async healthCheck() {
    if (!this.webhookUrl) {
      return {
        status: 'disabled',
        message: 'Webhook URL not configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      await axios.get(this.webhookUrl);
      return { status: 'healthy', message: 'Webhook accessible', timestamp: new Date().toISOString() };
    } catch (error) {
      if (error.response?.status === 405) {
        return { status: 'healthy', message: 'Webhook exists', timestamp: new Date().toISOString() };
      } else {
        return { status: 'error', message: error.message, timestamp: new Date().toISOString() };
      }
    }
  }

  // Convenience methods
  async logInfo(functionName, fileName, message, data = null, metadata = {}) {
    return this.log({ level: 'INFO', functionName, fileName, message, data, metadata });
  }

  async logWarn(functionName, fileName, message, data = null, metadata = {}) {
    return this.log({ level: 'WARN', functionName, fileName, message, data, metadata });
  }

  async logError(functionName, fileName, message, error = null, data = null, metadata = {}) {
    return this.log({ level: 'ERROR', functionName, fileName, message, error, data, metadata });
  }

  async logDebug(functionName, fileName, message, data = null, metadata = {}) {
    return this.log({ level: 'DEBUG', functionName, fileName, message, data, metadata });
  }

  async logSuccess(functionName, fileName, message, data = null, response = null, metadata = {}) {
    return this.log({ level: 'SUCCESS', functionName, fileName, message, data, response, metadata });
  }
}

module.exports = DiscordWebhookService;
