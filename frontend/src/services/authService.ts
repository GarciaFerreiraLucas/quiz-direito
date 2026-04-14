import type { User } from '../types/auth';
import api from './api';

export async function authenticateUser(login: string, password: string): Promise<User | null> {
  try {
    const response = await api.post('/login', { login, password });
    if (response.data && response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function getGuestUser(): User {
  return {
    id: 0, // Use 0 to avoid collision with real user IDs
    name: 'Visitante (Offline)',
    role: 'user',
    email: 'visitante@example.com'
  };
}
