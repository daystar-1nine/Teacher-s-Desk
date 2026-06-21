import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMockMode } from '../services/supabase';
import { mockOperations, mockProfiles } from '../services/mockData';
import type { Profile, UserRole } from '../types';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isMock: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (
    email: string, 
    firstName: string, 
    lastName: string, 
    role: UserRole, 
    schoolId: string
  ) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isMockMode) {
          // Check localStorage for mock session
          const savedMockUser = localStorage.getItem('td_mock_user');
          if (savedMockUser) {
            setUser(JSON.parse(savedMockUser));
          } else {
            // Default to Sarah Jenkins (Teacher) to make viewing the app instant
            const defaultUser = mockProfiles.find(p => p.email === 'sarah.jenkins@alabaster.edu') || null;
            setUser(defaultUser);
            if (defaultUser) {
              localStorage.setItem('td_mock_user', JSON.stringify(defaultUser));
            }
          }
          setLoading(false);
          return;
        }

        // Live Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Error initializing auth:', err);
        setError(err.message || 'Auth initialization failed');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes if in live mode
    if (!isMockMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_, session) => {
          setLoading(true);
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Role Resolver chain: 
      // 1. Check user_roles mapping table
      // 2. Fall back to profiles table
      // 3. Fall back to auth.users metadata

      // Step 1: Query profiles
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        // Step 2: Fall back to checking auth user metadata
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const fallbackProfile: Profile = {
            id: authUser.id,
            school_id: authUser.user_metadata?.school_id || null,
            first_name: authUser.user_metadata?.first_name || 'User',
            last_name: authUser.user_metadata?.last_name || '',
            email: authUser.email || '',
            role: (authUser.user_metadata?.role as UserRole) || 'student',
            created_at: authUser.created_at
          };
          setUser(fallbackProfile);
          return;
        }
        throw profileErr;
      }

      // Step 3: Check if they have an active school_id role override
      const { data: roleOverride } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('school_id', profile.school_id)
        .maybeSingle();

      const finalProfile: Profile = {
        ...profile,
        role: roleOverride?.role || profile.role
      };

      setUser(finalProfile);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Could not retrieve user profile settings.');
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        const profile = mockOperations.login(email);
        if (profile) {
          setUser(profile);
          localStorage.setItem('td_mock_user', JSON.stringify(profile));
          setLoading(false);
          return true;
        } else {
          setError('User not found. Try student.alex@alabaster.edu or sarah.jenkins@alabaster.edu');
          setLoading(false);
          return false;
        }
      }

      // Live mode login
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (loginErr) throw loginErr;
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isMockMode) {
        setUser(null);
        localStorage.removeItem('td_mock_user');
      } else {
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error('Error during sign out:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (
    email: string, 
    firstName: string, 
    lastName: string, 
    role: UserRole, 
    schoolId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Create a mock profile
        const newProfile: Profile = {
          id: `mock-user-${Date.now()}`,
          school_id: schoolId,
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`,
          created_at: new Date().toISOString()
        };
        mockProfiles.push(newProfile);
        setUser(newProfile);
        localStorage.setItem('td_mock_user', JSON.stringify(newProfile));
        setLoading(false);
        return true;
      }

      // Live Mode Registration
      const { data: authData, error: signupErr } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // Standard practice requires user verification reset
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
            school_id: schoolId
          }
        }
      });

      if (signupErr) throw signupErr;

      if (authData.user) {
        // Trigger profile creation
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: authData.user.id,
          school_id: schoolId,
          first_name: firstName,
          last_name: lastName,
          email,
          role
        });
        if (profileErr) throw profileErr;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, isMock: isMockMode, error, login, logout, registerUser, clearError }}>
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
