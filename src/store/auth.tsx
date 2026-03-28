import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import * as authApi from '@/api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(false);

  const persist = useCallback((u: User, t: string) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('access_token', t);
    setUser(u);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      persist(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  const register = useCallback(async (payload: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      persist(res.user, res.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    if (token && !user) {
      authApi.getMe()
        .then((u) => setUser(u))
        .catch(() => logout());
    }
  }, [token, user, logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
