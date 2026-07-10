import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../database/pool';
import { User } from '../models/user.model';
import { Session } from '../models/session.model';
import { AppError } from '../middlewares/errorHandler';
import { findUserById } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '5d';

interface LoginDto {
  email: string;
  password?: string;
}

export async function login(dto: LoginDto): Promise<{ user: User; token: string }> {
  if (!dto.password) {
    throw new AppError('Password is required', 400);
  }

  const userRecord = await queryOne<User & { password_hash: string }>(
    'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
    [dto.email]
  );

  if (!userRecord) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await bcrypt.compare(dto.password, userRecord.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = await findUserById(userRecord.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 5);

  const [session] = await query<Session>(
    `INSERT INTO sessions (user_id, expires_at)
     VALUES ($1, $2)
     RETURNING id, user_id, is_active, expires_at, created_at`,
    [user.id, expiresAt]
  );

  const payload = {
    sessionId: session.id,
    userId: user.id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as unknown as number });

  return { user, token };
}

export async function logout(sessionId: string): Promise<void> {
  await query('UPDATE sessions SET is_active = false WHERE id = $1', [sessionId]);
}

export async function verifySession(sessionId: string): Promise<{ session: Session; user: User }> {
  const session = await queryOne<Session>(
    'SELECT * FROM sessions WHERE id = $1 AND is_active = true AND expires_at > NOW()',
    [sessionId]
  );

  if (!session) {
    throw new AppError('Session is invalid or expired', 401);
  }

  const user = await findUserById(session.user_id);

  return { session, user };
}
