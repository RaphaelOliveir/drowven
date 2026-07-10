import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, workArea } = req.query;
    const users = await userService.findAllUsers({
      search: search as string,
      workArea: workArea as string,
    });
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.findUserById(req.params.id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.createUser(req.body);
    sendCreated(res, user);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await userService.deleteUser(req.params.id);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
}
