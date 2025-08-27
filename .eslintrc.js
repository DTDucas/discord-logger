module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }],
    'no-console': 'off',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'eol-last': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    'camelcase': ['error', { 'properties': 'never' }],
    'no-undef': 'error'
  },
  globals: {
    // Browser globals
    'DiscordLogger': 'readonly',
    'btoa': 'readonly',
    'atob': 'readonly',
    
    // Node.js globals (when needed in browser context)
    'Buffer': 'readonly',
    'process': 'readonly',
    'global': 'readonly'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off'
      }
    },
    {
      files: ['examples/**/*.js'],
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      files: ['webpack.config.js', 'jest.config.js', '.eslintrc.js'],
      env: {
        node: true
      },
      parserOptions: {
        sourceType: 'script'
      }
    }
  ]
};