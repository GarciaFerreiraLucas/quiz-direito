import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types/auth';
import { authenticateUser, getGuestUser } from '../services/authService';
import api from '../services/api';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (login: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('quiz_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => sessionStorage.getItem('quiz_is_guest') === 'true');

  const login = useCallback(async (loginStr: string, password: string): Promise<boolean> => {
    const authenticated = await authenticateUser(loginStr, password);
    if (authenticated) {
      setUser(authenticated);
      sessionStorage.setItem('quiz_user', JSON.stringify(authenticated));
      sessionStorage.setItem('quiz_is_guest', 'false');
      setIsGuest(false);
      return true;
    }
    return false;
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser = getGuestUser();
    setUser(guestUser);
    sessionStorage.setItem('quiz_user', JSON.stringify(guestUser));
    sessionStorage.setItem('quiz_is_guest', 'true');
    setIsGuest(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('quiz_user');
    sessionStorage.removeItem('quiz_is_guest');
    localStorage.removeItem('token');
    setIsGuest(false);
  }, []);

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    [user]
  );

  const updateProfile = useCallback(
    async (data: Partial<User> & { password?: string }) => {
      if (!user) return;
      
      const payload: any = {};
      if (data.name) payload.nome = data.name;
      if (data.email) payload.email = data.email;
      if (data.password) payload.password = data.password;

      try {
        const res = await api.put('/perfil', payload);
        const { token: newToken, user: updatedUser } = res.data;

        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        
        const formatUpdate: User = {
          ...user,
          name: updatedUser.name || user.name,
          email: updatedUser.email || user.email,
        };

        setUser(formatUpdate);
        sessionStorage.setItem('quiz_user', JSON.stringify(formatUpdate));
      } catch (err: any) {
        throw new Error(err.response?.data?.error || 'Erro ao atualizar perfil.');
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest,
        login,
        loginAsGuest,
        logout,
        hasRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context.isAuthenticated && context.isAuthenticated === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
