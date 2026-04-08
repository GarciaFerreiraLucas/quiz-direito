export type UserRole = 'user' | 'professor' | 'monitor';

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

/** Role labels for display */
export const roleLabels: Record<UserRole, string> = {
  user: 'Aluno',
  professor: 'Professor',
  monitor: 'Monitor',
};
