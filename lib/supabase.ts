import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Direct configuration values
const supabaseConfig = {
  url: 'https://tgbutvnbqzjtexgfxvkl.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYnV0dm5icXpqdGV4Z2Z4dmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjY1NzQsImV4cCI6MjA2Nzg0MjU3NH0.Uk6CLz14z3xDFkH52SYHnsvJSaHy88f1xn8sjhAnJjM'
};

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Custom storage implementation for Supabase
const supabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    debug: __DEV__,
  },
  global: {
    headers: {
      'X-Client-Info': `hoop-master/${Platform.OS}`,
    },
  },
});

// Database types
export type Tables = {
  profiles: {
    id: string;
    email: string;
    name: string | null;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
  };
  // Add other table types as needed
};