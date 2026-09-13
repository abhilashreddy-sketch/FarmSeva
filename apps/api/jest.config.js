module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 30000,
  moduleNameMapper: {
    '^@farm-seva/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
};
