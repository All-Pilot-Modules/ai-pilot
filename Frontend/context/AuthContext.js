'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth.isAuthenticated()) {
          const userData = await auth.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const result = await auth.login(identifier, password);
      // User data is now in result.user from backend
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return await auth.register(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    // Use Next.js router for better UX
    router.push('/');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    // Check token directly, not user state (prevents race condition)
    isAuthenticated: auth.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};