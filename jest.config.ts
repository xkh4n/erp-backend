import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Trata .ts como ESM
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { useESM: true, tsconfig: 'tsconfig.json' }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Ajusta patrones según cómo nombres tus tests:
  testMatch: [
    '**/__tests__/**/*.(test|spec).ts',
    '**/?(*.)+(test|spec).ts'
  ]
};

export default config;
