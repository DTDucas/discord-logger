// Basic tests for Discord Logger
const axios = require('axios');
const logger = require('../src/index');
const { LoggerService, DiscordWebhookService, GitHubStorageService } = require('../src/index');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('Discord Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset logger configuration
    logger.configure({
      discordWebhookUrl: null,
      githubToken: null
    });
  });

  describe('Configuration', () => {
    test('should configure discord webhook URL', () => {
      const webhookUrl = TestUtils.MOCK_WEBHOOK_URL;
      logger.configure({ discordWebhookUrl: webhookUrl });

      expect(logger.discordService.webhookUrl).toBe(webhookUrl);
    });

    test('should configure github token', () => {
      const token = TestUtils.MOCK_GITHUB_TOKEN;
      logger.configure({ githubToken: token });

      expect(logger.githubService.githubToken).toBe(token);
    });

    test('should validate webhook URL format', () => {
      expect(() => {
        logger.configure({ discordWebhookUrl: 'invalid-url' });
      }).toThrow('Invalid Discord webhook URL format');
    });

    test('should validate GitHub token format', () => {
      expect(() => {
        logger.configure({ githubToken: 'invalid-token' });
      }).toThrow('Invalid GitHub token format');
    });
  });

  describe('Basic Logging', () => {
    beforeEach(() => {
      logger.configure({
        discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL
      });
      mockedAxios.post.mockResolvedValue(TestUtils.mockResponse(200, { success: true }));
    });

    test('should log info message', async () => {
      const result = await logger.info('Test info message', { key: 'value' });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('INFO'),
              description: 'Test info message'
            })
          ])
        }),
        expect.any(Object)
      );
    });

    test('should log warning message', async () => {
      const result = await logger.warn('Test warning', { threshold: '80%' });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('WARN'),
              description: 'Test warning',
              color: 16776960 // Yellow color
            })
          ])
        }),
        expect.any(Object)
      );
    });

    test('should log error with Error object', async () => {
      const error = new Error('Test error');
      const result = await logger.error('Error occurred', error, { context: 'test' });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('ERROR'),
              description: 'Error occurred',
              color: 15158332 // Red color
            })
          ])
        }),
        expect.any(Object)
      );
    });

    test('should log success message', async () => {
      const result = await logger.success('Task completed', { id: 123 }, { status: 'done' });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('SUCCESS'),
              description: 'Task completed',
              color: 5763719 // Green color
            })
          ])
        }),
        expect.any(Object)
      );
    });

    test('should log debug message', async () => {
      const result = await logger.debug('Debug info', { variable: 'value' });

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('DEBUG'),
              description: 'Debug info',
              color: 9807270 // Purple color
            })
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('Timer Functionality', () => {
    beforeEach(() => {
      logger.configure({ discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL });
      mockedAxios.post.mockResolvedValue(TestUtils.mockResponse(200, { success: true }));
    });

    test('should create and stop timer', async () => {
      const timer = logger.startTimer('test-operation');

      expect(timer).toHaveProperty('stop');
      expect(typeof timer.stop).toBe('function');

      // Advance time
      jest.advanceTimersByTime(1000);

      const result = await timer.stop('Operation completed', { records: 100 });

      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('label', 'test-operation');
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('Context Logging', () => {
    beforeEach(() => {
      logger.configure({ discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL });
      mockedAxios.post.mockResolvedValue(TestUtils.mockResponse(200, { success: true }));
    });

    test('should create context logger', () => {
      const contextLogger = logger.withContext({ requestId: 'req_123' });

      expect(contextLogger).toHaveProperty('info');
      expect(contextLogger).toHaveProperty('warn');
      expect(contextLogger).toHaveProperty('error');
      expect(contextLogger).toHaveProperty('debug');
      expect(contextLogger).toHaveProperty('success');
      expect(contextLogger).toHaveProperty('context');
    });

    test('should include context in logs', async () => {
      const contextLogger = logger.withContext({ requestId: 'req_123', userId: 'user_456' });

      await contextLogger.info('Context test message');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        TestUtils.MOCK_WEBHOOK_URL,
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              description: 'Context test message',
              fields: expect.arrayContaining([
                expect.objectContaining({
                  name: '📋 Metadata',
                  value: expect.stringContaining('requestId')
                })
              ])
            })
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('Batch Logging', () => {
    beforeEach(() => {
      logger.configure({ discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL });
      mockedAxios.post.mockResolvedValue(TestUtils.mockResponse(200, { success: true }));
    });

    test('should process batch of logs', async () => {
      const logs = [
        { level: 'info', message: 'Batch item 1', data: { id: 1 } },
        { level: 'warn', message: 'Batch item 2', data: { id: 2 } },
        { level: 'success', message: 'Batch item 3', data: { id: 3 } }
      ];

      const results = await logger.batch(logs, { batchId: 'batch_001' });

      expect(results).toHaveLength(3);
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);

      // Check that each call includes batch metadata
      for (let i = 0; i < 3; i++) {
        expect(mockedAxios.post).toHaveBeenNthCalledWith(
          i + 1,
          TestUtils.MOCK_WEBHOOK_URL,
          expect.objectContaining({
            embeds: expect.arrayContaining([
              expect.objectContaining({
                fields: expect.arrayContaining([
                  expect.objectContaining({
                    name: '📋 Metadata',
                    value: expect.stringContaining('batch_001')
                  })
                ])
              })
            ])
          }),
          expect.any(Object)
        );
      }
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      logger.configure({ discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL });

      // Mock successful Discord health check
      mockedAxios.get.mockResolvedValueOnce(TestUtils.mockResponse(405)); // Discord returns 405 for GET on webhook

      const health = await logger.healthCheck();

      expect(health).toHaveProperty('discord');
      expect(health).toHaveProperty('github');
      expect(health).toHaveProperty('overall');
      expect(health.discord.status).toBe('healthy');
    });

    test('should handle disabled services', async () => {
      // Reset logger to have no configuration
      logger.configure({
        discordWebhookUrl: null,
        githubToken: null
      });

      const health = await logger.healthCheck();

      expect(health.discord.status).toBe('disabled');
      expect(health.github.status).toBe('disabled');
      expect(health.overall.status).toBe('disabled');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      logger.configure({ discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL });
    });

    test('should handle network errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await logger.info('Test message');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should handle rate limiting', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 429,
          headers: { 'retry-after': '1' }
        }
      }).mockResolvedValueOnce(TestUtils.mockResponse(200, { success: true }));

      const result = await logger.info('Rate limited message');

      // Should eventually succeed after retry
      expect(result.success).toBe(true);
    });
  });

  describe('Factory Methods', () => {
    test('should create logger with factory method', () => {
      const customLogger = LoggerService.create({
        discordWebhookUrl: TestUtils.MOCK_WEBHOOK_URL
      });

      expect(customLogger).toBeInstanceOf(LoggerService);
      expect(customLogger.discordService.webhookUrl).toBe(TestUtils.MOCK_WEBHOOK_URL);
    });

    test('should create logger with createWithConfig', () => {
      const customLogger = LoggerService.createWithConfig(
        TestUtils.MOCK_WEBHOOK_URL,
        TestUtils.MOCK_GITHUB_TOKEN
      );

      expect(customLogger).toBeInstanceOf(LoggerService);
      expect(customLogger.discordService.webhookUrl).toBe(TestUtils.MOCK_WEBHOOK_URL);
      expect(customLogger.githubService.githubToken).toBe(TestUtils.MOCK_GITHUB_TOKEN);
    });
  });

  describe('Service Classes', () => {
    test('should create DiscordWebhookService', () => {
      const discord = new DiscordWebhookService();
      expect(discord).toBeInstanceOf(DiscordWebhookService);
      expect(discord.webhookUrl).toBeNull();
    });

    test('should create GitHubStorageService', () => {
      const github = new GitHubStorageService();
      expect(github).toBeInstanceOf(GitHubStorageService);
      expect(github.githubToken).toBeNull();
    });
  });
});
