const { test, expect } = require('@playwright/test');

test.describe('Discord Logger Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the browser example
    await page.goto('/examples/browser-usage.html');
  });

  test('should load Discord Logger library', async ({ page }) => {
    // Check if the library is loaded
    const isLoaded = await page.evaluate(() => {
      return typeof DiscordLogger !== 'undefined';
    });
    
    expect(isLoaded).toBe(true);
  });

  test('should have version information', async ({ page }) => {
    const version = await page.evaluate(() => {
      return DiscordLogger.version || 'unknown';
    });
    
    expect(version).toBeDefined();
  });

  test('should create logger instance', async ({ page }) => {
    const canCreateLogger = await page.evaluate(() => {
      try {
        const logger = DiscordLogger.create({
          discordWebhookUrl: 'https://discord.com/api/webhooks/123/test'
        });
        return logger !== null && typeof logger === 'object';
      } catch (error) {
        return false;
      }
    });
    
    expect(canCreateLogger).toBe(true);
  });

  test('should handle configuration errors gracefully', async ({ page }) => {
    const handlesError = await page.evaluate(() => {
      try {
        DiscordLogger.create({
          discordWebhookUrl: 'invalid-url'
        });
        return false; // Should have thrown an error
      } catch (error) {
        return error.message.includes('Invalid Discord webhook URL');
      }
    });
    
    expect(handlesError).toBe(true);
  });

  test('should have all required methods', async ({ page }) => {
    const methods = await page.evaluate(() => {
      const logger = DiscordLogger.create({});
      
      return {
        hasInfo: typeof logger.info === 'function',
        hasWarn: typeof logger.warn === 'function',
        hasError: typeof logger.error === 'function',
        hasDebug: typeof logger.debug === 'function',
        hasSuccess: typeof logger.success === 'function',
        hasStartTimer: typeof logger.startTimer === 'function',
        hasBatch: typeof logger.batch === 'function',
        hasWithContext: typeof logger.withContext === 'function',
        hasHealthCheck: typeof logger.healthCheck === 'function'
      };
    });
    
    Object.values(methods).forEach(hasMethod => {
      expect(hasMethod).toBe(true);
    });
  });

  test('should handle environment detection', async ({ page }) => {
    const envInfo = await page.evaluate(() => {
      return {
        isNode: DiscordLogger.Helpers.isNode(),
        isBrowser: DiscordLogger.Helpers.isBrowser()
      };
    });
    
    expect(envInfo.isNode).toBe(false);
    expect(envInfo.isBrowser).toBe(true);
  });
});