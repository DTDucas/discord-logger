# Discord Logger - Setup Guide

This guide will help you set up the Discord Logger package for development and publishing.

## 📋 Prerequisites

- Node.js 16+ (recommended: Node.js 18+)
- npm or yarn
- Git
- GitHub account
- NPM account (for publishing)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd "C:\Users\dtacc\Documents\DTDucas\WorkSpace\Personal\Git\MyProjects\Public\discord-logger"
npm install
```

### 2. Run Tests

```bash
# Unit tests
npm test

# Coverage report
npm run test:coverage

# Linting
npm run lint
```

### 3. Build Package

```bash
# Build all formats (CJS, ESM, Browser)
npm run build

# Individual builds
npm run build:cjs     # CommonJS
npm run build:esm     # ES Modules  
npm run build:browser # Browser bundle
```

## 🔧 Development Setup

### Local Testing

```bash
# Test the package locally
npm pack
npm install -g discord-logger-1.0.0.tgz

# Or link for development
npm link
cd /path/to/test-project
npm link discord-logger
```

### Browser Testing

```bash
# Start test server
npm run build:browser
npx http-server . -p 8080

# Run browser tests (requires Playwright)
npx playwright install
npm run test:browser
```

## 📦 Publishing Setup

### 1. GitHub Repository

Create a new repository at: https://github.com/DTDucas/discord-logger

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Discord Logger v1.0.0"
git branch -M main
git remote add origin https://github.com/DTDucas/discord-logger.git
git push -u origin main
```

### 2. NPM Setup

```bash
# Login to NPM
npm login

# Check package name availability
npm view discord-logger

# Dry run publish
npm publish --dry-run

# Publish (will be automated via CI/CD)
npm publish
```

### 3. GitHub Secrets Configuration

Add the following secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

#### Required Secrets:
- `NPM_TOKEN`: NPM authentication token
  - Go to https://www.npmjs.com/settings/tokens
  - Create "Automation" token
  - Copy token value

#### Optional Discord Webhook Secrets:
- `DISCORD_WEBHOOK_RELEASES`: For release notifications
- `DISCORD_WEBHOOK_ERRORS`: For build error notifications  
- `DISCORD_WEBHOOK_SECURITY`: For security alert notifications

#### Optional:
- `CODECOV_TOKEN`: For code coverage reports

### 4. GitHub Actions

The CI/CD pipeline will automatically:
- ✅ Run tests on Node.js 16, 18, 20
- 🔒 Security audit
- 🌐 Browser compatibility tests
- 📦 Build all package formats
- 🚀 Publish to NPM (on main branch)
- 🏷️ Create GitHub releases
- 📢 Send Discord notifications

## 🔧 Configuration Files

### Package.json Scripts
```json
{
  "build": "npm run build:cjs && npm run build:esm && npm run build:browser",
  "test": "jest",
  "test:coverage": "jest --coverage",
  "lint": "eslint src/ --fix",
  "validate": "npm run lint && npm run test"
}
```

### Key Files
- `src/index.js` - CommonJS entry point
- `src/index.esm.js` - ES Module entry point
- `types/index.d.ts` - TypeScript definitions
- `dist/discord-logger.min.js` - Browser bundle (generated)
- `webpack.config.js` - Browser build configuration
- `.babelrc` - Babel transpilation config
- `jest.config.js` - Test configuration
- `.eslintrc.js` - Code quality rules

## 🧪 Testing Strategy

### Unit Tests (Jest)
- Core functionality
- Error handling
- Configuration validation
- All logging methods
- Timer functionality
- Context logging
- Health checks

### Browser Tests (Playwright)
- Library loading
- Cross-browser compatibility
- Bundle size validation
- API availability

### Integration Tests
- Discord webhook integration
- GitHub API integration
- Network error handling
- Rate limiting

## 📚 Usage Examples

### Node.js
```javascript
const logger = require('discord-logger');

logger.configure({
  discordWebhookUrl: 'YOUR_WEBHOOK_URL',
  // GitHub configuration is optional
  github: {
    token: 'YOUR_GITHUB_TOKEN',
    owner: 'your-github-username',  // Required if using GitHub
    repo: 'your-logs-repository'    // Required if using GitHub
  }
});

await logger.info('Application started', { version: '1.0.0' });
```

### Browser
```html
<script src="https://unpkg.com/discord-logger/dist/discord-logger.min.js"></script>
<script>
  const logger = DiscordLogger.create({
    discordWebhookUrl: 'YOUR_WEBHOOK_URL'
  });
  
  logger.info('Browser app loaded');
</script>
```

### TypeScript
```typescript
import logger, { LoggerService } from 'discord-logger';

const customLogger: LoggerService = logger.create({
  discordWebhookUrl: process.env.DISCORD_WEBHOOK!
});

await customLogger.info('TypeScript logging works!');
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (>=14)
   - Clear node_modules and reinstall
   - Check for syntax errors

2. **Test Failures**
   - Ensure all dependencies installed
   - Check mock configurations
   - Verify test environment setup

3. **Publishing Issues**
   - Verify NPM authentication
   - Check package name availability
   - Ensure version increment

4. **CI/CD Issues**
   - Check GitHub secrets
   - Verify workflow syntax
   - Review action logs

### Debug Commands

```bash
# Check package info
npm ls discord-logger
npm view discord-logger

# Test local installation  
npm pack
tar -tf discord-logger-*.tgz

# Validate package
npm run validate
npm audit
```

## 🛠️ Maintenance

### Version Updates
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Push to main branch
5. CI/CD will handle the rest

### Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update
npm audit fix
```

### Security
- Regular dependency audits
- Automated security scanning
- Discord webhook notifications
- No secrets in code

## 📞 Support

- 🐛 [Report Issues](https://github.com/DTDucas/discord-logger/issues)
- 💡 [Feature Requests](https://github.com/DTDucas/discord-logger/issues)
- 📖 [Documentation](https://github.com/DTDucas/discord-logger#readme)
- 📧 [Email](mailto:baymax.contact@gmail.com)

---

**Author**: Duong Tran Quang - DTDucas  
**License**: MIT  
**Repository**: https://github.com/DTDucas/discord-logger