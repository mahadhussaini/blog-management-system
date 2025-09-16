module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // Disable some overly strict rules for this project
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'warn',
    'react/jsx-key': 'error',
    'react/prop-types': 'off', // Using TypeScript would be better for prop validation

    // Custom rules for better code quality
    'no-console': 'warn', // Always warn, never error
    'prefer-const': 'error',
    'no-var': 'error',

    // React specific rules
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    '*.config.js',
  ],
};
