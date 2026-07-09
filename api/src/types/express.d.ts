import { Request } from 'express';
import { User } from '../models/user.model';
import { Session } from '../models/session.model';

export interface TypedRequest<
  TBody = unknown,
  TParams = Record<string, string>,
  TQuery = Record<string, string>,
> extends Request {
  body: TBody;
  params: TParams;
  query: TQuery;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}
