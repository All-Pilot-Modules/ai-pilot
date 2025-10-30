'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticated = auth.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const userData = await auth.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
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
      console.log('✅ Login successful, setting user state:', result.user?.id || result.user?.sub);
      setUser(result.user);
      setIsAuthenticated(true);
      console.log('✅ Auth state updated: isAuthenticated=true');
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsAuthenticated(false);
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
    setIsAuthenticated(false);
    // Use Next.js router for better UX
    router.push('/');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
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