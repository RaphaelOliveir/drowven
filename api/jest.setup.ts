/**
 * jest.setup.ts — runs BEFORE any module is imported in each test worker.
 * Setting env vars here ensures src/config/env.ts reads the test values.
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = process.env.TEST_DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT ?? '5432';
process.env.DB_NAME = process.env.TEST_DB_NAME ?? 'drowven_test';
process.env.DB_USER = process.env.TEST_DB_USER ?? 'drowven_user';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? 'drowven_password';
