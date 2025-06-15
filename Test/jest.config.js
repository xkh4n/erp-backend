module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/Test/setup.ts'],
    globals: {
      'ts-jest': {
        isolatedModules: true
      }
    }
  }