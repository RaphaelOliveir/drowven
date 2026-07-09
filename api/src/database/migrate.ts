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
  `
  -- Add password_hash to users if it doesn't exist (handled by simply adding it for v2)
  ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

  -- Create sessions table
  CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  `,
  `
  CREATE TABLE IF NOT EXISTS work_areas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS user_areas (
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    work_area_id  UUID NOT NULL REFERENCES work_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, work_area_id)
  );

  INSERT INTO work_areas (name) VALUES
    ('Information Technology (IT)'), ('Engineering'), ('Healthcare'), ('Education'),
    ('Business & Management'), ('Finance'), ('Accounting'), ('Legal'), ('Sales'),
    ('Marketing'), ('Communications'), ('Design'), ('Creative Arts'), ('Architecture'),
    ('Construction'), ('Manufacturing'), ('Transportation'), ('Logistics'), ('Agriculture'),
    ('Forestry'), ('Fisheries'), ('Environmental Services'), ('Energy'), ('Mining'),
    ('Hospitality'), ('Tourism'), ('Food & Beverage'), ('Public Safety'), ('Military'),
    ('Government'), ('Public Administration'), ('Human Resources'), ('Customer Service'),
    ('Facilities Management'), ('Maintenance'), ('Real Estate'), ('Insurance'), ('Science'),
    ('Research & Development (R&D)'), ('Biotechnology'), ('Pharmaceuticals'), ('Media'),
    ('Entertainment'), ('Publishing'), ('Telecommunications'), ('Sports'),
    ('Fitness & Recreation'), ('Beauty & Personal Care'), ('Social Services'), ('Nonprofit'),
    ('Religion'), ('Entrepreneurship'), ('Consulting'), ('Quality Assurance'), ('Procurement'),
    ('Supply Chain'), ('Product Management'), ('Data & Analytics'), ('Cybersecurity'),
    ('Artificial Intelligence'), ('Aerospace'), ('Maritime'), ('Utilities'), ('Waste Management')
  ON CONFLICT (name) DO NOTHING;
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
