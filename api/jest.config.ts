import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Load env vars before any module is required
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // Where Jest looks for tests
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],

  // ts-jest transform config
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          // Relax strict settings that are only needed for production
          noUnusedLocals: false,
          noUnusedParameters: false,
        },
      },
    ],
  },

  // Ensure the pool is closed after tests (no open handles)
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
  clearMocks: true,

  // Human-readable test timeout (10 s — integration tests can be slow)
  testTimeout: 10_000,
};

export default config;
