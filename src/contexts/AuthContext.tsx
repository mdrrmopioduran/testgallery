import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiClient from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          joinDate: new Date(userData.created_at || userData.joinDate),
          lastActive: new Date(userData.updated_at || userData.lastActive),
          totalImages: userData.totalImages || 0,
          totalViews: userData.totalViews || 0,
          isActive: userData.is_active !== undefined ? userData.is_active : userData.isActive
        });
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.data) {
        const userData: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role as 'admin' | 'photographer' | 'user',
          avatar: response.data.user.avatar,
          joinDate: new Date(response.data.user.created_at),
          lastActive: new Date(response.data.user.updated_at),
          totalImages: 0,
          totalViews: 0,
          isActive: response.data.user.is_active
        };
        
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.logout();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};