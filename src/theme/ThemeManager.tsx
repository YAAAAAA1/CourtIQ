import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from './ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for async storage
const THEME_PREFERENCE_KEY = '@app/theme-preference';

type ThemePreference = 'light' | 'dark' | 'system';

/**
 * ThemeManager component that handles theme persistence and system theme changes
 * Should be rendered inside ThemeProvider
 */
export function ThemeManager() {
  const systemColorScheme = useColorScheme();
  const { setTheme } = useTheme();

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY) as ThemePreference | null;
        
        if (savedPreference === 'system' || !savedPreference) {
          // Use system theme
          setTheme(systemColorScheme === 'dark');
        } else {
          // Use saved theme
          setTheme(savedPreference === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
        // Fallback to system theme
        setTheme(systemColorScheme === 'dark');
      }
    };

    loadThemePreference();
  }, [systemColorScheme, setTheme]);

  return null;
}

/**
 * Hook to get and set theme preference
 */
export function useThemePreference() {
  const { isDark, setTheme } = useTheme();

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
      
      // If preference is system, use the system color scheme
      if (preference === 'system') {
        const systemColorScheme = useColorScheme();
        setTheme(systemColorScheme === 'dark');
      } else {
        setTheme(preference === 'dark');
      }
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const getCurrentPreference = (): ThemePreference => {
    return isDark ? 'dark' : 'light';
  };

  return {
    themePreference: getCurrentPreference(),
    setThemePreference,
  };
}

/**
 * Hook to toggle between light and dark theme
 */
export function useToggleTheme() {
  const { themePreference, setThemePreference } = useThemePreference();
  
  const toggleTheme = () => {
    setThemePreference(themePreference === 'dark' ? 'light' : 'dark');
  };

  return {
    toggleTheme,
    isDark: themePreference === 'dark',
    themePreference,
  };
}
