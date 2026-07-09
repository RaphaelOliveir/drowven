import { getPool } from './pool';

const migrations: string[] = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
];

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      version    INTEGER NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (let i = 0; i < migrations.length; i++) {
    const version = i + 1;
    const { rowCount } = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [
      version,
    ]);

    if (!rowCount) {
      console.log(`[DB] Running migration v${version}...`);
      await pool.query(migrations[i]);
      await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
      console.log(`[DB] Migration v${version} applied.`);
    }
  }

  console.log('[DB] All migrations are up to date.');
}
