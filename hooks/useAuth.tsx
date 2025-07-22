import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a properly typed wrapper for AsyncStorage
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

export type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  hasCompletedOnboarding: boolean;
};

export interface CustomAuthError {
  message: string;
  code?: string;
  status?: number;
}

export type AuthResponse = {
  error: CustomAuthError | null;
  data?: {
    user: UserProfile | null;
    session: Session | null;
  };
};

export type AuthState = {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: CustomAuthError | null }>;
  setIsNewUser: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  refreshSession: () => Promise<void>;
};

// Create a context with a default value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    isNewUser: boolean;
    hasCompletedOnboarding: boolean;
  }>({
    user: null,
    session: null,
    loading: true,
    isNewUser: false,
    hasCompletedOnboarding: false,
  });
  const authState = useAuthHook();
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook implementation
const useAuthHook = (): AuthState => {
  const [state, setState] = useState<{
    user: UserProfile | null;
    session: Session | null;
    loading: boolean;
    isNewUser: boolean;
    hasCompletedOnboarding: boolean;
  }>({
    user: null,
    session: null,
    loading: true,
    isNewUser: false,
    hasCompletedOnboarding: false,
  });

  const refreshSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (currentSession?.user) {
        const { data: userData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Get onboarding status from storage
        const onboardingCompleted = await storage.getItem(`onboarding_completed_${currentSession.user.id}`);
        
        const userProfile: UserProfile = {
          id: userData.id,
          email: userData.email || currentSession.user.email || '',
          name: userData.name || null,
          profile_image_url: userData.profile_image_url || null,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          hasCompletedOnboarding: onboardingCompleted === 'true',
        };
        
        setState(prev => ({
          ...prev,
          user: userProfile,
          session: currentSession,
          hasCompletedOnboarding: userProfile.hasCompletedOnboarding,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          hasCompletedOnboarding: false,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    // Initial session check
    refreshSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await refreshSession();
        } else {
          setState(prev => ({
            ...prev,
            session: null,
            user: null,
            hasCompletedOnboarding: false,
            loading: false,
          }));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession]);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // First, check if a user with this email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return {
          error: {
            message: 'A user with this email already exists',
            code: 'auth/email-already-in-use',
            status: 400
          }
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            status: error.status
          } 
        };
      }

      if (!data.user) {
        return {
          error: {
            message: 'Failed to create user account',
            code: 'auth/user-creation-failed',
            status: 500
          }
        };
      }

          // Create user profile in the database
      const newUser: UserProfile = {
        id: data.user.id,
        email: email,
        name: null,
        profile_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hasCompletedOnboarding: false, // Default to false for new users
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          profile_image_url: newUser.profile_image_url,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
          hasCompletedOnboarding: newUser.hasCompletedOnboarding,
        });

      if (profileError) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }
      
      // Store onboarding status in AsyncStorage
      await storage.setItem(
        `onboarding_completed_${newUser.id}`, 
        String(newUser.hasCompletedOnboarding)
      );

      // Update the state with the new user
      setState(prev => ({
        ...prev,
        isNewUser: true,
        user: newUser,
        session: data.session,
        loading: false,
      }));
      
      return { 
        error: null, 
        data: { 
          user: newUser, 
          session: data.session 
        } 
      };
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { 
        error: { 
          message: `Sign up failed: ${errorMessage}`,
          code: 'auth/signup-failed',
          status: 500
        } 
      };
    } finally {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { 
          error: { 
            message: error.message, 
            code: error.status?.toString(),
            status: error.status
          } 
        };
      }

      if (!data.session || !data.user) {
        return {
          error: {
            message: 'No session or user data returned',
            code: 'auth/no-session'
          }
        };
      }

      // Fetch the latest user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        return {
          error: {
            message: 'Failed to fetch user profile',
            code: 'profile/fetch-failed'
          }
        };
      }

      // Get onboarding status from storage
      const onboardingCompleted = await storage.getItem(`onboarding_completed_${profileData.id}`);
      
      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email || data.user.email || '',
        name: profileData.name || null,
        profile_image_url: profileData.profile_image_url || null,
        created_at: profileData.created_at || new Date().toISOString(),
        updated_at: profileData.updated_at || new Date().toISOString(),
        hasCompletedOnboarding: onboardingCompleted === 'true',
      };

      setState(prev => ({
        ...prev,
        user: userProfile,
        session: data.session,
        loading: false,
      }));

      return { 
        error: null, 
        data: { 
          user: userProfile, 
          session: data.session 
        } 
      };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { 
        error: { 
          message: `Sign in failed: ${errorMessage}`,
          code: 'auth/signin-failed'
        } 
      };
    } finally {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear any stored onboarding state
      if (state.user?.id) {
        await storage.removeItem(`onboarding_completed_${state.user.id}`);
      }
      
      setState({
        user: null,
        session: null,
        loading: false,
        isNewUser: false,
        hasCompletedOnboarding: false,
      });
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { 
        error: { 
          message: `Sign out failed: ${errorMessage}`,
          code: 'auth/signout-failed',
          status: error instanceof SupabaseAuthError ? error.status : 500
        } 
      };
    }
  }, [state.user?.id]);

  const setIsNewUser = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, isNewUser: value }));
  }, []);

  const setHasCompletedOnboarding = useCallback(async (value: boolean) => {
    if (state.user?.id) {
      await storage.setItem(`onboarding_completed_${state.user.id}`, value.toString());
    }
    setState(prev => ({ ...prev, hasCompletedOnboarding: value }));
  }, [state.user?.id]);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    isNewUser: state.isNewUser,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    signIn,
    signUp,
    signOut,
    setIsNewUser,
    setHasCompletedOnboarding,
    refreshSession,
  };
};

// Create a custom hook to use the auth context
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
