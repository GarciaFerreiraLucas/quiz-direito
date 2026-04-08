import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types/auth';
import { authenticateUser, getGuestUser, updateMockUserProfile } from '../services/authService';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (login: string, password: string) => boolean;
  loginAsGuest: () => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateProfile: (data: Partial<User> & { password?: string }) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('quiz_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => sessionStorage.getItem('quiz_is_guest') === 'true');

  const login = useCallback((loginStr: string, password: string): boolean => {
    const authenticated = authenticateUser(loginStr, password);
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
    (data: Partial<User> & { password?: string }) => {
      if (!user) return;
      const updated = updateMockUserProfile(user.id, data);
      if (updated) {
        setUser(updated);
        sessionStorage.setItem('quiz_user', JSON.stringify(updated));
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
