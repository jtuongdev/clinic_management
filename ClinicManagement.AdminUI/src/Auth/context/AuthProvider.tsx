// ClinicManagement.AdminUl > src › Auth › context ›AuthProvider.tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { UserInfo } from '../types/type.auth';

interface AuthContextType {
  user: UserInfo | null;

  accessToken: string | null;

  refreshToken: string | null;

  isAuthenticated: boolean;

  login: (
    accessToken: string,
    refreshToken: string,
    user: UserInfo
  ) => void;

  logout: () => void;

  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('accessToken')
  );

  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => localStorage.getItem('refreshToken')
  );

  const [user, setUser] = useState<UserInfo | null>(() => {
    const userJson = localStorage.getItem('user');

    return userJson ? JSON.parse(userJson) : null;
  });

  const login = (
    token: string,
    refresh: string,
    userInfo: UserInfo
  ) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userInfo));

    setAccessToken(token);
    setRefreshToken(refresh);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // =========================
  // KIỂM TRA QUYỀN
  // =========================
  const hasRole = (role: string) => {
    return user?.roles?.includes(role) ?? false;
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      login,
      logout,
      hasRole,
    }),
    [user, accessToken, refreshToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}