import bcrypt from 'bcrypt';
import { query, queryOne } from '../database/pool';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { AppError } from '../middlewares/errorHandler';

export async function findAllUsers(filters?: { search?: string; workArea?: string }): Promise<User[]> {
  let queryStr = 'SELECT u.id, u.name, u.email, u.description, u.projects, u.experience, u.created_at, u.updated_at FROM users u';
  const queryParams: any[] = [];
  const conditions: string[] = [];

  if (filters?.workArea) {
    queryStr += `
      JOIN user_areas ua ON u.id = ua.user_id
      JOIN work_areas wa ON ua.work_area_id = wa.id
    `;
    queryParams.push(filters.workArea);
    conditions.push(`wa.name = $${queryParams.length}`);
  }

  if (filters?.search) {
    queryParams.push(`%${filters.search}%`);
    conditions.push(`(u.name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length} OR EXISTS (SELECT 1 FROM user_areas ua2 JOIN work_areas wa2 ON ua2.work_area_id = wa2.id WHERE ua2.user_id = u.id AND wa2.name ILIKE $${queryParams.length}))`);
  }

  if (conditions.length > 0) {
    queryStr += ' WHERE ' + conditions.join(' AND ');
  }

  queryStr += ' ORDER BY u.created_at DESC';

  return query<User>(queryStr, queryParams);
}

export async function findUserById(id: string): Promise<User> {
  const user = await queryOne<User>(
    'SELECT id, name, email, description, projects, experience, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  if (!user) {
    throw new AppError(`User with id "${id}" not found`, 404);
  }

  const workAreas = await query<{ name: string }>(
    'SELECT wa.name FROM work_areas wa JOIN user_areas ua ON wa.id = ua.work_area_id WHERE ua.user_id = $1',
    [id]
  );
  if (workAreas.length > 0) {
    user.areas = workAreas.map(wa => wa.name);
  }

  return user;
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1', [dto.email]);

  if (existing) {
    throw new AppError(`Email "${dto.email}" is already in use`, 409);
  }

  if (!dto.password) {
    throw new AppError('Password is required', 400);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(dto.password, saltRounds);

  const [user] = await query<User>(
    `INSERT INTO users (name, email, password_hash, description, projects, experience)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, description, projects, experience, created_at, updated_at`,
    [dto.name, dto.email, passwordHash, dto.description, dto.projects, dto.experience]
  );

  if (dto.areas && dto.areas.length > 0) {
    const placeholders = dto.areas.map((_, i) => `$${i + 1}`).join(', ');
    const workAreas = await query<{ id: string; name: string }>(
      `SELECT id, name FROM work_areas WHERE name IN (${placeholders})`,
      dto.areas
    );

    if (workAreas.length > 0) {
      const userAreasValues = workAreas.map((_, i) => `($1, $${i + 2})`).join(', ');
      const queryParams = [user.id, ...workAreas.map((wa) => wa.id)];
      await query(`INSERT INTO user_areas (user_id, work_area_id) VALUES ${userAreasValues}`, queryParams);
      
      user.areas = workAreas.map((wa) => wa.name);
    }
  }

  return user;
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  await findUserById(id);

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (dto.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(dto.name);
  }

  if (dto.email !== undefined) {
    const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1 AND id != $2', [
      dto.email,
      id,
    ]);
    if (existing) {
      throw new AppError(`Email "${dto.email}" is already in use`, 409);
    }
    fields.push(`email = $${paramIndex++}`);
    values.push(dto.email);
  }

  if (dto.password) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    fields.push(`password_hash = $${paramIndex++}`);
    values.push(passwordHash);
  }

  if (dto.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(dto.description);
  }

  if (dto.projects !== undefined) {
    fields.push(`projects = $${paramIndex++}`);
    values.push(dto.projects);
  }

  if (dto.experience !== undefined) {
    fields.push(`experience = $${paramIndex++}`);
    values.push(dto.experience);
  }

  if (fields.length === 0 && dto.areas === undefined) {
    throw new AppError('No fields to update', 400);
  }

  let user: User | undefined;

  if (fields.length > 0) {
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const [updatedUser] = await query<User>(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, name, email, description, projects, experience, created_at, updated_at`,
      values
    );
    user = updatedUser;
  } else {
    user = await findUserById(id);
  }

  if (dto.areas !== undefined) {
    await query('DELETE FROM user_areas WHERE user_id = $1', [id]);
    
    if (dto.areas.length > 0) {
      const placeholders = dto.areas.map((_, i) => `$${i + 1}`).join(', ');
      const workAreas = await query<{ id: string; name: string }>(
        `SELECT id, name FROM work_areas WHERE name IN (${placeholders})`,
        dto.areas
      );

      if (workAreas.length > 0) {
        const userAreasValues = workAreas.map((_, i) => `($1, $${i + 2})`).join(', ');
        const queryParams = [id, ...workAreas.map((wa) => wa.id)];
        await query(`INSERT INTO user_areas (user_id, work_area_id) VALUES ${userAreasValues}`, queryParams);
      }
    }
    const updatedAreas = await query<{ name: string }>(
      'SELECT wa.name FROM work_areas wa JOIN user_areas ua ON wa.id = ua.work_area_id WHERE ua.user_id = $1',
      [id]
    );
    if (user) {
      user.areas = updatedAreas.map(wa => wa.name);
    }
  }

  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await findUserById(id);

  await query('DELETE FROM users WHERE id = $1', [id]);
}

export async function findSuggestedUsers(userId: string): Promise<User[]> {
  return query<User>(
    `SELECT DISTINCT u.id, u.name, u.email, u.description, u.projects, u.experience, u.created_at, u.updated_at 
     FROM users u
     JOIN user_areas ua1 ON u.id = ua1.user_id
     JOIN user_areas ua2 ON ua1.work_area_id = ua2.work_area_id
     WHERE ua2.user_id = $1 AND u.id != $1
     ORDER BY u.created_at DESC`,
    [userId]
  );
}
