// Discord Logger - Main Entry Point
// A powerful Discord webhook logger with GitHub file storage for large content
// Works in both Node.js and browser environments

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

// Version
module.exports.version = require('../package.json').version;
