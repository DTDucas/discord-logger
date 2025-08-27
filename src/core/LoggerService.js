// Universal imports - works in both Node.js and browsers
const DiscordWebhookService = (typeof require !== 'undefined') ? require('./DiscordWebhookService') : window.DiscordLogger?.DiscordWebhookService;
const GitHubStorageService = (typeof require !== 'undefined') ? require('./GitHubStorageService') : window.DiscordLogger?.GitHubStorageService;
const Helpers = (typeof require !== 'undefined') ? require('../utils/helpers') : window.DiscordLogger?.Helpers;

class LoggerService {
  constructor(config = {}) {
    this.discord = new DiscordWebhookService(config.discord || {});
    this.github = new GitHubStorageService(config.github || {});

    // Link GitHub storage to Discord service
    this.discord.setGitHubStorage(this.github);

    // Apply initial configuration
    if (config) {
      this.configure(config);
    }
  }

  configure(config) {
    if (config.discord) {
      this.discord.configure(config.discord);
    }

    if (config.github) {
      this.github.configure(config.github);
    }

    // Backward compatibility
    if (config.discordWebhookUrl) {
      this.discord.setWebhookUrl(config.discordWebhookUrl);
    }

    if (config.githubToken) {
      this.github.setToken(config.githubToken);
    }

    return this;
  }

  async info(message, data = null, metadata = {}) {
    const caller = Helpers.getCaller();
    return this.discord.logInfo(
      caller.function,
      caller.file,
      message,
      data,
      metadata
    );
  }

  async warn(message, data = null, metadata = {}) {
    const caller = Helpers.getCaller();
    return this.discord.logWarn(
      caller.function,
      caller.file,
      message,
      data,
      metadata
    );
  }

  async error(message, error = null, data = null, metadata = {}) {
    const caller = Helpers.getCaller();
    return this.discord.logError(
      caller.function,
      caller.file,
      message,
      error,
      data,
      metadata
    );
  }

  async debug(message, data = null, metadata = {}) {
    const caller = Helpers.getCaller();
    return this.discord.logDebug(
      caller.function,
      caller.file,
      message,
      data,
      metadata
    );
  }

  async success(message, data = null, response = null, metadata = {}) {
    const caller = Helpers.getCaller();
    return this.discord.logSuccess(
      caller.function,
      caller.file,
      message,
      data,
      response,
      metadata
    );
  }

  async log(options) {
    if (!options.functionName || !options.fileName) {
      const caller = Helpers.getCaller();
      options.functionName = options.functionName || caller.function;
      options.fileName = options.fileName || caller.file;
    }
    return this.discord.log(options);
  }

  startTimer(label) {
    const startTime = Date.now();

    return {
      stop: async (message, data = null, metadata = {}) => {
        const duration = Date.now() - startTime;
        const perfMetadata = {
          ...metadata,
          duration_ms: duration,
          timer_label: label,
          started_at: new Date(startTime).toISOString()
        };

        await this.info(
          message || `Timer '${label}' completed`,
          data,
          perfMetadata
        );
        return { duration, label };
      }
    };
  }

  async batch(logs, commonMetadata = {}) {
    const batchId = Helpers.generateId();
    const promises = logs.map(async (logItem, index) => {
      const metadata = {
        ...commonMetadata,
        batch_id: batchId,
        batch_index: index,
        batch_total: logs.length
      };
      return this.log({ ...logItem, metadata });
    });
    return Promise.all(promises);
  }

  withContext(context) {
    const contextId = Helpers.generateId();

    return {
      info: (message, data = null, metadata = {}) =>
        this.info(message, data, {
          ...metadata,
          context,
          context_id: contextId
        }),

      warn: (message, data = null, metadata = {}) =>
        this.warn(message, data, {
          ...metadata,
          context,
          context_id: contextId
        }),

      error: (message, error = null, data = null, metadata = {}) =>
        this.error(message, error, data, {
          ...metadata,
          context,
          context_id: contextId
        }),

      debug: (message, data = null, metadata = {}) =>
        this.debug(message, data, {
          ...metadata,
          context,
          context_id: contextId
        }),

      success: (message, data = null, response = null, metadata = {}) =>
        this.success(message, data, response, {
          ...metadata,
          context,
          context_id: contextId
        }),

      context
    };
  }

  async sendNotification(data) {
    return this.discord.sendNotification(data);
  }

  async healthCheck() {
    const discord = await this.discord.healthCheck();
    const github = await this.github.healthCheck();

    const hasError = discord.status === 'error' || github.status === 'error';
    const hasDisabled = discord.status === 'disabled' && github.status === 'disabled';

    let overallStatus = 'healthy';
    if (hasError) {
      overallStatus = 'error';
    } else if (hasDisabled) {
      overallStatus = 'disabled';
    }

    return {
      discord,
      github,
      overall: {
        status: overallStatus,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Getter methods for direct access to services
  get discordService() {
    return this.discord;
  }

  get githubService() {
    return this.github;
  }

  // Static factory methods
  static create(config = {}) {
    return new LoggerService(config);
  }

  static createWithConfig(webhookUrl, githubToken, options = {}) {
    return new LoggerService({
      discordWebhookUrl: webhookUrl,
      githubToken: githubToken,
      ...options
    });
  }
}

module.exports = LoggerService;
