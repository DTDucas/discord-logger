// Discord Logger - ESM Entry Point
// A powerful Discord webhook logger with GitHub file storage for large content
// Works in both Node.js and browser environments

// Note: This is a placeholder ESM file.
// For proper ESM support, the source files would need to be converted to ES modules.
// For now, we'll use a simple re-export approach.

const LoggerService = require('./core/LoggerService');
const DiscordWebhookService = require('./core/DiscordWebhookService');
const GitHubStorageService = require('./core/GitHubStorageService');
const Helpers = require('./utils/helpers');

// Create default logger instance
const logger = new LoggerService();

// Export main logger instance and classes
module.exports = logger;
module.exports.LoggerService = LoggerService;
module.exports.DiscordWebhookService = DiscordWebhookService;
module.exports.GitHubStorageService = GitHubStorageService;
module.exports.Helpers = Helpers;

// Export factory functions
module.exports.create = LoggerService.create;
module.exports.createWithConfig = LoggerService.createWithConfig;

// Export individual services from default logger
module.exports.discord = logger.discordService;
module.exports.github = logger.githubService;

// Re-export main logger methods for convenience
module.exports.info = (...args) => logger.info(...args);
module.exports.warn = (...args) => logger.warn(...args);
module.exports.error = (...args) => logger.error(...args);
module.exports.debug = (...args) => logger.debug(...args);
module.exports.success = (...args) => logger.success(...args);
module.exports.log = (...args) => logger.log(...args);
module.exports.startTimer = (...args) => logger.startTimer(...args);
module.exports.batch = (...args) => logger.batch(...args);
module.exports.withContext = (...args) => logger.withContext(...args);
module.exports.sendNotification = (...args) => logger.sendNotification(...args);
module.exports.healthCheck = (...args) => logger.healthCheck(...args);
module.exports.configure = (...args) => logger.configure(...args);

// Version
module.exports.version = require('../package.json').version;
