import { NextFunction, Request, Response } from 'express';
import { DatabaseSession } from '../../sql/database-session';
import { DEFAULT_POOL } from '../../sql/DEFAULT_POOL';

export type SessionRequest = Request & { db: DatabaseSession, user: { [key: string]: any } };

export function setDatabaseSession(req: Request, res: Response, next: NextFunction) {
  req['db'] = new DatabaseSession(DEFAULT_POOL, req['user']);
  next();
}

