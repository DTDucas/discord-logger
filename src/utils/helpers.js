class Helpers {
  static isNode() {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  }

  static isBrowser() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  static getCaller() {
    if (!this.isNode()) {
      return {
        function: 'unknown',
        file: 'browser',
        fullPath: 'browser',
        line: 0,
        column: 0
      };
    }

    const stack = new Error().stack;
    const stackLines = stack.split('\n');

    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line && !line.includes('logger') && !line.includes('Logger')) {
        const match = line.match(/at\s+(?:(.+?)\s+\()?(.+):(\d+):(\d+)/);
        if (match) {
          const functionName = match[1] || 'anonymous';
          const fullPath = match[2];
          const fileName = fullPath
            .split(/[/\\]/)
            .pop()
            .replace('.js', '')
            .replace('.ts', '');

          return {
            function: functionName,
            file: fileName,
            fullPath: fullPath,
            line: parseInt(match[3]),
            column: parseInt(match[4])
          };
        }
      }
    }

    return {
      function: 'unknown',
      file: 'unknown',
      fullPath: 'unknown',
      line: 0,
      column: 0
    };
  }

  static sanitizeForDiscord(text, maxLength = 2000) {
    if (!text) return '';

    // Remove or escape Discord markdown characters that might break formatting
    const sanitized = text.toString()
      .replace(/```/g, '\\`\\`\\`')
      .replace(/`/g, '\\`')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\~')
      .replace(/\|/g, '\\|');

    return this.truncateText(sanitized, maxLength);
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static validateWebhookUrl(url) {
    if (!url) return false;
    const webhookRegex = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
    return webhookRegex.test(url);
  }

  static validateGitHubToken(token) {
    if (!token) return false;
    // GitHub tokens start with ghp_, gho_, ghu_, ghs_, ghr_, or github_pat_
    const tokenRegex = /^(ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[a-zA-Z0-9_]+$/;
    return tokenRegex.test(token);
  }

  static processEnvironment() {
    if (this.isNode()) {
      return {
        platform: process.platform,
        nodeVersion: process.version,
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: Math.round(process.uptime())
      };
    } else {
      return {
        platform: 'browser',
        userAgent: navigator.userAgent,
        memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'unknown',
        uptime: Math.round(performance.now() / 1000)
      };
    }
  }
}

module.exports = Helpers;
