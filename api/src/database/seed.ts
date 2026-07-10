import bcrypt from 'bcrypt';
import { getPool, closePool } from './pool';

async function seed() {
  const pool = getPool();
  console.log('[Seed] Starting database seed...');

  try {
    // 1. Fetch work areas
    const { rows: workAreas } = await pool.query('SELECT id, name FROM work_areas LIMIT 10');
    
    if (workAreas.length < 2) {
      throw new Error('Not enough work areas found. Did you run migrations?');
    }

    const mainWorkArea = workAreas[0]; // For the 13 users
    const otherWorkArea = workAreas[1]; // For the 7 users

    console.log(`[Seed] Main Work Area (13 users): ${mainWorkArea.name}`);
    console.log(`[Seed] Other Work Area (7 users): ${otherWorkArea.name}`);

    // 2. Generate users
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const usersToInsert = Array.from({ length: 20 }, (_, i) => ({
      name: `Seed User ${i + 1}`,
      email: `seed.user${i + 1}@example.com`,
      password_hash: passwordHash,
      description: `Description for seed user ${i + 1}`,
      projects: `Projects for seed user ${i + 1}`,
      experience: `Experience for seed user ${i + 1}`,
      // First 13 get mainWorkArea, next 7 get otherWorkArea
      workAreaId: i < 13 ? mainWorkArea.id : otherWorkArea.id,
    }));

    // 3. Clear existing seed users
    await pool.query("DELETE FROM users WHERE email LIKE 'seed.user%@example.com'");

    console.log('[Seed] Inserting 20 users...');
    for (const user of usersToInsert) {
      const { rows } = await pool.query(`
        INSERT INTO users (name, email, password_hash, description, projects, experience)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [user.name, user.email, user.password_hash, user.description, user.projects, user.experience]);

      const userId = rows[0].id;

      await pool.query(`
        INSERT INTO user_areas (user_id, work_area_id)
        VALUES ($1, $2)
      `, [userId, user.workAreaId]);
    }

    console.log('[Seed] Seed completed successfully.');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  } finally {
    await closePool();
  }
}

seed();
