import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../lib/tokens.js';

export interface AuthedRequest extends Request {
  userId?: number;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    res.status(401).json({ message: '인증이 필요합니다.' });
    return;
  }

  try {
    req.userId = verifyToken(token).userId;
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}
