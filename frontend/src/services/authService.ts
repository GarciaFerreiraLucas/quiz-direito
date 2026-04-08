import type { User } from '../types/auth';

interface MockUser extends User {
  password: string;
}

/** Pre-configured users for development */
export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: 'cliente',
    role: 'user',
    email: 'cliente@gmail.com',
    password: '123',
  },
  {
    id: 2,
    name: 'sergio',
    role: 'professor',
    email: 'sergio',
    password: '123',
  },
  {
    id: 3,
    name: 'admin',
    role: 'monitor',
    email: 'admin',
    password: '123',
  },
];

/**
 * Simulates login. Accepts either the name or email as login.
 * Returns user data (without password) on success, null on failure.
 */
export function authenticateUser(login: string, password: string): User | null {
  const found = mockUsers.find(
    (u) =>
      (u.email.toLowerCase() === login.toLowerCase() ||
        u.name.toLowerCase() === login.toLowerCase()) &&
      u.password === password
  );

  if (!found) return null;

  const { password: _, ...user } = found;
  return user;
}

export function getGuestUser(): User {
  const student = mockUsers.find((u) => u.role === 'user') ?? mockUsers[0];
  const { password: _, ...user } = student;
  return user;
}

/**
 * Updates a mock user's profile.
 * In a real scenario, this would be a PUT request to the backend.
 */
export function updateMockUserProfile(id: number, data: Partial<MockUser>): User | null {
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) return null;

  mockUsers[index] = { ...mockUsers[index], ...data };

  const { password: _, ...user } = mockUsers[index];
  return user;
}
