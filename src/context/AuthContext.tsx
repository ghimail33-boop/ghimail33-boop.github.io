import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'admin' | 'inspector' | 'reviewer' | 'public_officer') => Promise<void>;
  isAdmin: boolean;
  isInspector: boolean;
  isReviewer: boolean;
  isPublicOfficer: boolean;
  canEditInspection: boolean;
  canVerify: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick preset user credentials
const DEMO_CREDENTIALS: Record<string, { u: string; p: string }> = {
  admin: { u: 'admin', p: 'admin123' },
  inspector: { u: 'inspector', p: 'inspector123' },
  reviewer: { u: 'reviewer', p: 'reviewer123' },
  public_officer: { u: 'viewer', p: 'viewer123' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nvc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load current user profile on boot
  useEffect(() => {
    async function initUser() {
      if (token) {
        try {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        } catch (err) {
          console.warn('Token expired or invalid');
          localStorage.removeItem('nvc_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    initUser();
  }, []);

  const login = async (u: string, p: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(u, p);
      localStorage.setItem('nvc_token', res.token);
      setToken(res.token);
      setCurrentUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nvc_token');
    setToken(null);
    setCurrentUser(null);
  };

  const switchRole = async (role: 'admin' | 'inspector' | 'reviewer' | 'public_officer') => {
    setIsLoading(true);
    try {
      const creds = DEMO_CREDENTIALS[role];
      if (creds) {
        const res = await api.login(creds.u, creds.p);
        localStorage.setItem('nvc_token', res.token);
        setToken(res.token);
        setCurrentUser(res.user);
      }
    } catch (e) {
      console.error('Failed to switch role:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const isInspector = role === 'inspector';
  const isReviewer = role === 'reviewer';
  const isPublicOfficer = role === 'public_officer';
  const canEditInspection = isAdmin || isInspector;
  const canVerify = isAdmin || isReviewer;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isLoading,
        login,
        logout,
        switchRole,
        isAdmin,
        isInspector,
        isReviewer,
        isPublicOfficer,
        canEditInspection,
        canVerify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
