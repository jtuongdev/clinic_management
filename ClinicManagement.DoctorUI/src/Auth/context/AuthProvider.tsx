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

  isDoctor: boolean;

  login: (
    accessToken: string,
    refreshToken: string,
    user: UserInfo
  ) => void;

  logout: () => void;

  hasRole: (role: string) => boolean;

  hasAnyRole: (roles: string[]) => boolean;
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

  const normalizeRole = (r: string) => r.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const hasRole = (role: string) => {
    if (!user?.roles || user.roles.length === 0) return false;
    const targetNorm = normalizeRole(role);
    return user.roles.some(r => {
      const uNorm = normalizeRole(r);
      return uNorm === targetNorm || uNorm.includes(targetNorm) || targetNorm.includes(uNorm);
    });
  };

  const hasAnyRole = (roles: string[]) => {
    if (!user?.roles || user.roles.length === 0) return false;
    return roles.some(role => hasRole(role));
  };

  const isDoctor = useMemo(() => {
    return hasAnyRole(['BAC_SI', 'BacSi', 'BAC_SI_KHAM_BENH', 'QUAN_TRI_HE_THONG', 'ADMIN']);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: !!accessToken,
      isDoctor,
      login,
      logout,
      hasRole,
      hasAnyRole,
    }),
    [user, accessToken, refreshToken, isDoctor]
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