import { Request } from 'express';

export interface TypedRequest<
  TBody = unknown,
  TParams = Record<string, string>,
  TQuery = Record<string, string>,
> extends Request {
  body: TBody;
  params: TParams;
  query: TQuery;
}
