import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.createUser(req.body);
    sendCreated(res, user);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.session?.id) {
      await authService.logout(req.session.id);
    }
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, req.user);
  } catch (err) {
    next(err);
  }
}
