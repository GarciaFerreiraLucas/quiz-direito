import { Request } from 'express';

export interface AuthPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthPayload;
}

// Helper type for route handlers that accept AuthenticatedRequest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AuthHandler = (...args: any[]) => any;
