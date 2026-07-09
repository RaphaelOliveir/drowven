import { Request, Response } from 'express';
import { sendError } from '../utils/response';

export function notFound(_req: Request, res: Response): void {
  sendError(res, 'Route not found', 404);
}
