import bcrypt from 'bcrypt';
import { query, queryOne } from '../database/pool';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { AppError } from '../middlewares/errorHandler';

export async function findAllUsers(): Promise<User[]> {
  return query<User>(
    'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
}

export async function findUserById(id: string): Promise<User> {
  const user = await queryOne<User>(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  if (!user) {
    throw new AppError(`User with id "${id}" not found`, 404);
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
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [dto.name, dto.email, passwordHash]
  );

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

  if (fields.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const [user] = await query<User>(
    `UPDATE users SET ${fields.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, name, email, created_at, updated_at`,
    values
  );

  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await findUserById(id);

  await query('DELETE FROM users WHERE id = $1', [id]);
}
