import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { verifySession } from '../services/auth.service';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_me_in_production';

interface JwtPayload {
  sessionId: string;
  userId: string;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is missing or invalid', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Token is invalid or expired', 401);
    }

    const { session, user } = await verifySession(decoded.sessionId);

    req.user = user;
    req.session = session;

    next();
  } catch (err) {
    next(err);
  }
}
