import { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory that checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER the `authenticate` middleware.
 *
 * Handles the admin/professor role mapping:
 * - DB stores 'admin', JWT/frontend uses 'professor'
 * - Accepts both 'admin' and 'professor' interchangeably
 *
 * Usage: router.get('/admin-only', authenticate, authorize('admin', 'monitor'), handler);
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ error: 'Não autenticado.' });
      return;
    }

    // Normalize: treat 'admin' and 'professor' as equivalent
    const normalizedAllowed = new Set(allowedRoles);
    if (normalizedAllowed.has('admin')) normalizedAllowed.add('professor');
    if (normalizedAllowed.has('professor')) normalizedAllowed.add('admin');

    if (!normalizedAllowed.has(user.role)) {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return;
    }

    next();
  };
};
