// Universal imports - works in both Node.js and browsers
const axios = (typeof require !== 'undefined') ? require('axios') : window.axios;
const Helpers = (typeof require !== 'undefined') ? require('../utils/helpers') : window.DiscordLogger?.Helpers;

class GitHubStorageService {
  constructor(config = {}) {
    // Authentication
    this.githubToken = config.token || null;

    // Repository configuration - no defaults for public library
    this.repoOwner = config.owner || null;
    this.repoName = config.repo || null;
    this.branch = config.branch || 'main';

    // API endpoints - configurable for enterprise GitHub
    this.baseApiUrl = config.apiUrl || 'https://api.github.com';
    this.baseRawUrl = config.rawUrl || 'https://raw.githubusercontent.com';

    // Upload thresholds and limits
    this.maxFileSize = config.maxFileSize || 25 * 1024 * 1024; // 25MB default
    this.contentThreshold = config.contentThreshold || 1800; // chars before upload to GitHub

    // File organization
    this.useTimestampFolders = config.useTimestampFolders !== false; // default true
    this.folderFormat = config.folderFormat || 'YYYY-MM-DD'; // date format for folders
    this.fileExtension = config.fileExtension || 'json';

    // Commit message template
    this.commitMessageTemplate = config.commitMessageTemplate || 'Add log file: {filename} [{folder}]';

    // Request timeout
    this.requestTimeout = config.requestTimeout || 30000; // 30 seconds
  }

  setToken(token) {
    if (!Helpers.validateGitHubToken(token)) {
      throw new Error('Invalid GitHub token format');
    }
    this.githubToken = token;
  }

  configure(options = {}) {
    // Repository settings
    if (options.owner) this.repoOwner = options.owner;
    if (options.repo) this.repoName = options.repo;
    if (options.branch) this.branch = options.branch;
    if (options.token) this.setToken(options.token);

    // API endpoints (for enterprise GitHub)
    if (options.apiUrl) this.baseApiUrl = options.apiUrl;
    if (options.rawUrl) this.baseRawUrl = options.rawUrl;

    // Thresholds and limits
    if (options.maxFileSize) this.maxFileSize = options.maxFileSize;
    if (options.contentThreshold) this.contentThreshold = options.contentThreshold;

    // File organization
    if (options.useTimestampFolders !== undefined) this.useTimestampFolders = options.useTimestampFolders;
    if (options.folderFormat) this.folderFormat = options.folderFormat;
    if (options.fileExtension) this.fileExtension = options.fileExtension;

    // Templates and settings
    if (options.commitMessageTemplate) this.commitMessageTemplate = options.commitMessageTemplate;
    if (options.requestTimeout) this.requestTimeout = options.requestTimeout;
  }

  generateDailyFolder() {
    if (!this.useTimestampFolders) {
      return 'logs'; // simple logs folder if timestamp folders disabled
    }

    const now = new Date();
    // Support different folder formats
    if (this.folderFormat === 'YYYY-MM-DD') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (this.folderFormat === 'YYYY/MM/DD') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } else if (this.folderFormat === 'YYYY-MM') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }

    // Default format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateFileName(functionName, fileName, extension = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const cleanFunctionName = functionName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const ext = extension || this.fileExtension;
    return `${cleanFunctionName}-${cleanFileName}-${timestamp}.${ext}`;
  }

  async uploadToGitHub(content, functionName, fileName, directory = 'logs') {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    if (!this.repoOwner || !this.repoName) {
      throw new Error('GitHub repository owner and name must be configured');
    }

    try {
      const dailyFolder = this.generateDailyFolder();
      const filename = this.generateFileName(functionName, fileName);
      const filePath = `${directory}/${dailyFolder}/${filename}`;

      // Prepare content
      let jsonContent;
      if (typeof content === 'object') {
        jsonContent = JSON.stringify(content, null, 2);
      } else {
        jsonContent = String(content);
      }

      const base64Content = Helpers.isNode()
        ? Buffer.from(jsonContent).toString('base64')
        : btoa(unescape(encodeURIComponent(jsonContent)));

      // Check file size limit
      if (jsonContent.length > this.maxFileSize) {
        throw new Error(`Content size (${Helpers.formatFileSize(jsonContent.length)}) exceeds maximum allowed size (${Helpers.formatFileSize(this.maxFileSize)})`);
      }

      // Generate commit message from template
      const commitMessage = this.commitMessageTemplate
        .replace('{filename}', filename)
        .replace('{folder}', dailyFolder)
        .replace('{directory}', directory)
        .replace('{timestamp}', new Date().toISOString());

      const payload = {
        message: commitMessage,
        content: base64Content,
        branch: this.branch
      };

      const uploadUrl = `${this.baseApiUrl}/repos/${this.repoOwner}/${this.repoName}/contents/${filePath}`;

      const response = await axios.put(uploadUrl, payload, {
        timeout: this.requestTimeout,
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      });

      const rawUrl = `${this.baseRawUrl}/${this.repoOwner}/${this.repoName}/${this.branch}/${filePath}`;
      const webUrl = response.data.content.html_url;

      return {
        success: true,
        filename,
        filePath,
        rawUrl,
        webUrl,
        sha: response.data.content.sha,
        size: Helpers.formatFileSize(jsonContent.length),
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`GitHub upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  shouldUploadToGitHub(content, maxLength = null) {
    const threshold = maxLength || this.contentThreshold;

    if (typeof content === 'string') {
      return content.length > threshold;
    }
    if (typeof content === 'object') {
      const jsonString = JSON.stringify(content, null, 2);
      return jsonString.length > threshold;
    }
    return String(content).length > threshold;
  }

  async processContentForDiscord(content, functionName, fileName, type = 'data') {
    if (!content) {
      return { inline: true, text: 'No content provided' };
    }

    try {
      const textContent = typeof content === 'object'
        ? JSON.stringify(content, null, 2)
        : String(content);

      if (!this.shouldUploadToGitHub(textContent)) {
        if (typeof content === 'object') {
          return {
            inline: true,
            text: `\`\`\`json\n${Helpers.truncateText(textContent, 1000)}\n\`\`\``,
            length: textContent.length
          };
        } else {
          return {
            inline: true,
            text: Helpers.sanitizeForDiscord(textContent, 1000),
            length: textContent.length
          };
        }
      }

      const uploadResult = await this.uploadToGitHub(content, functionName, fileName, type);

      return {
        inline: false,
        uploadResult,
        text: `📁 Content too large for Discord (${Helpers.formatFileSize(textContent.length)})\n🔗 **View on GitHub:** [${uploadResult.filename}](${uploadResult.rawUrl})`,
        githubLink: uploadResult.rawUrl,
        webLink: uploadResult.webUrl,
        length: textContent.length
      };
    } catch (error) {
      const truncatedContent = typeof content === 'object'
        ? JSON.stringify(content, null, 2).substring(0, 1500) + '\n... [TRUNCATED - Upload failed]'
        : String(content).substring(0, 1500) + '... [TRUNCATED - Upload failed]';

      return {
        inline: true,
        text: Helpers.sanitizeForDiscord(truncatedContent),
        length: truncatedContent.length,
        uploadError: error.message
      };
    }
  }

  async healthCheck() {
    if (!this.githubToken) {
      return {
        status: 'disabled',
        message: 'GitHub token not configured',
        timestamp: new Date().toISOString()
      };
    }

    if (!this.repoOwner || !this.repoName) {
      return {
        status: 'disabled',
        message: 'GitHub repository owner and name not configured',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await axios.get(`${this.baseApiUrl}/repos/${this.repoOwner}/${this.repoName}`, {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      return {
        status: 'healthy',
        message: 'GitHub API accessible',
        repo: response.data.full_name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = GitHubStorageService;
