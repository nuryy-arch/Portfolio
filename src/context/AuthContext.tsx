import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_ADMIN_SESSION_KEY = 'atelier_admin_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check initial session
  useEffect(() => {
    const initAuth = async () => {
      // 1. Try Supabase Auth
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Verify admin role via profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if (profile?.role === 'admin') {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'admin',
              });
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      // 2. Check local simulated demo admin session
      try {
        const localSession = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
        if (localSession) {
          const parsed = JSON.parse(localSession);
          if (parsed && parsed.role === 'admin') {
            setUser(parsed);
          }
        }
      } catch {
        // ignore
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // 1. If Supabase is connected, use real Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Verify server-side role
          const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profErr || profile?.role !== 'admin') {
            await supabase.auth.signOut();
            return {
              success: false,
              error: 'Доступ ограничен. Учётная запись не обладает правами администратора.',
            };
          }

          const adminUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'admin',
          };
          setUser(adminUser);
          return { success: true };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Ошибка авторизации';
        return { success: false, error: msg };
      }
    }

    // 2. Local Demo fallback for portfolio review:
    // Credentials: admin@atelier.coffee / atelier2026
    if (
      (email.trim().toLowerCase() === 'admin@atelier.coffee' || email.trim().toLowerCase() === 'admin') &&
      pass === 'atelier2026'
    ) {
      const demoAdmin: AuthUser = {
        id: 'demo-admin-id',
        email: 'admin@atelier.coffee',
        role: 'admin',
      };
      setUser(demoAdmin);
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(demoAdmin));
      return { success: true };
    }

    return {
      success: false,
      error: 'Неверный логин или пароль. Для демонстрации используйте admin@atelier.coffee / atelier2026',
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error', err);
      }
    }
    localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        logout,
        isDemoMode: !isSupabaseConfigured,
      }}
    >
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
