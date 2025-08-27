declare module 'discord-logger' {
  export interface LogLevel {
    INFO: 'INFO';
    WARN: 'WARN';
    ERROR: 'ERROR';
    DEBUG: 'DEBUG';
    SUCCESS: 'SUCCESS';
  }

  export interface LogOptions {
    level?: string;
    functionName?: string;
    fileName?: string;
    message?: string;
    data?: any;
    error?: Error | any;
    response?: any;
    metadata?: Record<string, any>;
  }

  export interface TimerResult {
    duration: number;
    label: string;
  }

  export interface Timer {
    stop(message?: string, data?: any, metadata?: Record<string, any>): Promise<TimerResult>;
  }

  export interface ContextLogger {
    info(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    warn(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    error(message: string, error?: Error | any, data?: any, metadata?: Record<string, any>): Promise<any>;
    debug(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    success(message: string, data?: any, response?: any, metadata?: Record<string, any>): Promise<any>;
    context: any;
  }

  export interface HealthCheckResult {
    status: 'healthy' | 'error' | 'disabled';
    message: string;
    timestamp: string;
    [key: string]: any;
  }

  export interface OverallHealthCheck {
    discord: HealthCheckResult;
    github: HealthCheckResult;
    overall: {
      status: 'healthy' | 'error' | 'disabled';
      timestamp: string;
    };
  }

  export interface NotificationField {
    name: string;
    value: string;
    inline?: boolean;
  }

  export interface NotificationData {
    title?: string;
    description?: string;
    fields?: NotificationField[];
    color?: number;
    username?: string;
    avatarUrl?: string;
  }

  export interface DiscordLimits {
    username?: number;
    content?: number;
    embedTitle?: number;
    embedDescription?: number;
    fieldName?: number;
    fieldValue?: number;
    footerText?: number;
    totalCharacters?: number;
    maxEmbeds?: number;
    maxFields?: number;
  }

  export interface RateLimitConfig {
    minInterval?: number;
    maxRetries?: number;
    retryBackoff?: 'exponential' | 'fixed';
    retryMultiplier?: number;
  }

  export interface ColorScheme {
    ERROR?: number;
    WARN?: number;
    INFO?: number;
    DEBUG?: number;
    SUCCESS?: number;
  }

  export interface IconScheme {
    ERROR?: string;
    WARN?: string;
    INFO?: string;
    DEBUG?: string;
    SUCCESS?: string;
  }

  export interface DiscordConfig {
    webhookUrl?: string;
    serviceName?: string;
    avatarUrl?: string;
    footerText?: string;
    footerIconUrl?: string;
    limits?: DiscordLimits;
    rateLimit?: RateLimitConfig;
    colors?: ColorScheme;
    icons?: IconScheme;
    serviceIcons?: IconScheme;
  }

  export interface GitHubConfig {
    token?: string;
    owner?: string;
    repo?: string;
    branch?: string;
    apiUrl?: string;
    rawUrl?: string;
    maxFileSize?: number;
    contentThreshold?: number;
    useTimestampFolders?: boolean;
    folderFormat?: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYY-MM' | string;
    fileExtension?: string;
    commitMessageTemplate?: string;
    requestTimeout?: number;
  }

  export interface LoggerConfig {
    discord?: DiscordConfig;
    github?: GitHubConfig;
    discordWebhookUrl?: string; // Backward compatibility
    githubToken?: string; // Backward compatibility
  }

  export interface UploadResult {
    success: boolean;
    filename: string;
    filePath: string;
    rawUrl: string;
    webUrl: string;
    sha: string;
    size: string;
    uploadedAt: string;
  }

  export interface ContentResult {
    inline: boolean;
    text: string;
    length: number;
    uploadResult?: UploadResult;
    githubLink?: string;
    webLink?: string;
    uploadError?: string;
  }

  // Helpers class
  export class Helpers {
    static isNode(): boolean;
    static isBrowser(): boolean;
    static sleep(ms: number): Promise<void>;
    static truncateText(text: string, maxLength: number): string;
    static generateId(): string;
    static getCaller(): {
      function: string;
      file: string;
      fullPath: string;
      line: number;
      column: number;
    };
    static sanitizeForDiscord(text: string, maxLength?: number): string;
    static formatFileSize(bytes: number): string;
    static validateWebhookUrl(url: string): boolean;
    static validateGitHubToken(token: string): boolean;
    static processEnvironment(): {
      platform: string;
      nodeVersion?: string;
      userAgent?: string;
      memory: number | string;
      uptime: number;
    };
  }

  // GitHub Storage Service
  export class GitHubStorageService {
    constructor(config?: GitHubConfig);
    setToken(token: string): void;
    configure(options?: GitHubConfig): void;
    generateDailyFolder(): string;
    generateFileName(functionName: string, fileName: string, extension?: string): string;
    uploadToGitHub(content: any, functionName: string, fileName: string, directory?: string): Promise<UploadResult>;
    shouldUploadToGitHub(content: any, maxLength?: number): boolean;
    processContentForDiscord(content: any, functionName: string, fileName: string, type?: string): Promise<ContentResult>;
    healthCheck(): Promise<HealthCheckResult>;
  }

  // Discord Webhook Service
  export class DiscordWebhookService {
    constructor(config?: DiscordConfig);
    setWebhookUrl(url: string): void;
    setGitHubStorage(githubStorage: GitHubStorageService): void;
    configure(options?: DiscordConfig): void;
    log(options: LogOptions): Promise<any>;
    sendNotification(data: NotificationData): Promise<any>;
    healthCheck(): Promise<HealthCheckResult>;
    
    // Convenience methods
    logInfo(functionName: string, fileName: string, message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    logWarn(functionName: string, fileName: string, message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    logError(functionName: string, fileName: string, message: string, error?: Error | any, data?: any, metadata?: Record<string, any>): Promise<any>;
    logDebug(functionName: string, fileName: string, message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    logSuccess(functionName: string, fileName: string, message: string, data?: any, response?: any, metadata?: Record<string, any>): Promise<any>;
  }

  // Main Logger Service
  export class LoggerService {
    discord: DiscordWebhookService;
    github: GitHubStorageService;

    constructor(config?: LoggerConfig);
    configure(config: LoggerConfig): LoggerService;

    info(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    warn(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    error(message: string, error?: Error | any, data?: any, metadata?: Record<string, any>): Promise<any>;
    debug(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
    success(message: string, data?: any, response?: any, metadata?: Record<string, any>): Promise<any>;
    log(options: LogOptions): Promise<any>;

    startTimer(label: string): Timer;
    batch(logs: LogOptions[], commonMetadata?: Record<string, any>): Promise<any[]>;
    withContext(context: any): ContextLogger;
    sendNotification(data: NotificationData): Promise<any>;
    healthCheck(): Promise<OverallHealthCheck>;

    get discordService(): DiscordWebhookService;
    get githubService(): GitHubStorageService;

    static create(config?: LoggerConfig): LoggerService;
    static createWithConfig(webhookUrl: string, githubToken?: string, options?: LoggerConfig): LoggerService;
  }

  // Default export - main logger instance
  const logger: LoggerService;
  export default logger;

  // Named exports
  export const discord: DiscordWebhookService;
  export const github: GitHubStorageService;
  export const version: string;

  // Factory functions
  export function create(config?: LoggerConfig): LoggerService;
  export function createWithConfig(webhookUrl: string, githubToken?: string, options?: LoggerConfig): LoggerService;

  // Main logger methods (from default instance)
  export function info(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
  export function warn(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
  export function error(message: string, error?: Error | any, data?: any, metadata?: Record<string, any>): Promise<any>;
  export function debug(message: string, data?: any, metadata?: Record<string, any>): Promise<any>;
  export function success(message: string, data?: any, response?: any, metadata?: Record<string, any>): Promise<any>;
  export function log(options: LogOptions): Promise<any>;
  export function startTimer(label: string): Timer;
  export function batch(logs: LogOptions[], commonMetadata?: Record<string, any>): Promise<any[]>;
  export function withContext(context: any): ContextLogger;
  export function sendNotification(data: NotificationData): Promise<any>;
  export function healthCheck(): Promise<OverallHealthCheck>;
  export function configure(config: LoggerConfig): LoggerService;
}