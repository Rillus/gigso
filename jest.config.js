module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!your-module-name)' // Replace 'your-module-name' with any specific module you need to transform
  ],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
}; 