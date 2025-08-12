import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                role: 'admin' // First user becomes admin
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating profile:', createError);
              setUser(null);
            } else {
              const userData: User = {
                id: newProfile.id,
                name: newProfile.name,
                email: authUser.email || '',
                role: newProfile.role as 'admin' | 'photographer' | 'user',
                avatar: newProfile.avatar,
                joinDate: new Date(newProfile.created_at),
                lastActive: new Date(newProfile.updated_at),
                totalImages: newProfile.total_images || 0,
                totalViews: newProfile.total_views || 0,
                isActive: newProfile.is_active
              };
              setUser(userData);
            }
          }
        } else {
          setUser(null);
        }
      } else {
        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: session?.user?.email || '',
          role: profile.role as 'admin' | 'photographer' | 'user',
          avatar: profile.avatar,
          joinDate: new Date(profile.created_at),
          lastActive: new Date(profile.updated_at),
          totalImages: profile.total_images || 0,
          totalViews: profile.total_views || 0,
          isActive: profile.is_active
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        // Track login event
        await supabase
          .from('analytics_events')
          .insert({
            event_type: 'login',
            user_id: data.user.id
          });
      }

      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!session?.user,
    isAdmin: user?.role === 'admin',
    loading,
    session
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};