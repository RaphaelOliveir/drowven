import { Pool } from 'pg';
import { runMigrations } from '../../src/database/migrate';
import { closePool, getPool } from '../../src/database/pool';

export async function ensureTestDatabase(): Promise<void> {
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const dbName = process.env.DB_NAME ?? 'drowven_test';
    const { rows } = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [
      dbName,
    ]);

    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`[Test DB] Created database "${dbName}"`);
    }
  } finally {
    await adminPool.end();
  }
}

export async function setupTestDatabase(): Promise<void> {
  await ensureTestDatabase();
  await runMigrations();
}

export async function clearTables(): Promise<void> {
  const pool = getPool();
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
}

export async function teardownTestDatabase(): Promise<void> {
  await closePool();
}
