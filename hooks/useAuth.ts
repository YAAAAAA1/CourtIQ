import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export type User = {
  id: string;
  email: string;
  name: string | null;
  profile_image_url: string | null;
};

export type AuthState = {
  user: User | null;
  session: any | null;
  loading: boolean;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  setIsNewUser: (value: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
};

const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboardingStatus = async () => {
      const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (onboardingStatus === 'true') {
        setHasCompletedOnboarding(true);
      }
    };

    checkOnboardingStatus();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ? {
          id: currentSession.user.id,
          email: currentSession.user.email!,
          name: null,
          profile_image_url: null,
        } : null);
        setLoading(false);

        // If user signs up, mark as new user
        if (event === 'SIGNED_UP' as any) {
          setIsNewUser(true);
          await AsyncStorage.setItem('isNewUser', 'true');
        }

        // If user signs in, check if they're a new user
        if (event === 'SIGNED_IN') {
          const newUserStatus = await AsyncStorage.getItem('isNewUser');
          setIsNewUser(newUserStatus === 'true');
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ? {
        id: initialSession.user.id,
        email: initialSession.user.email!,
        name: null,
        profile_image_url: null,
      } : null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (!error) {
        setIsNewUser(true);
        await AsyncStorage.setItem('isNewUser', 'true');
      }
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateOnboardingStatus = async (value: boolean) => {
    setHasCompletedOnboarding(value);
    await AsyncStorage.setItem('hasCompletedOnboarding', value.toString());
  };

  const updateNewUserStatus = async (value: boolean) => {
    setIsNewUser(value);
    await AsyncStorage.setItem('isNewUser', value.toString());
  };

  return {
    user,
    session,
    loading,
    isNewUser,
    hasCompletedOnboarding,
    signUp,
    signIn,
    signOut,
    setIsNewUser: updateNewUserStatus,
    setHasCompletedOnboarding: updateOnboardingStatus,
  };
});

export { AuthProvider, useAuth };