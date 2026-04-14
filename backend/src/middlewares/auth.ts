import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret123';

// Sets req.user if a valid token is present, otherwise continues as guest (req.user = null)
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    (req as any).user = null;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    (req as any).user = null;
    return next();
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    (req as any).user = payload;
    next();
  } catch (err) {
    (req as any).user = null;
    next();
  }
};

// Strict middleware for routes that REQUIRE a logged-in user
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).user) {
    res.status(401).json({ error: 'Você precisa estar logado para acessar este recurso.' });
    return;
  }
  next();
};
