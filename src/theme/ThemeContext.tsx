import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { AppTheme, lightTheme, darkTheme } from './theme';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Theme context type
 */
type ThemeContextType = {
  /**
   * The current theme
   */
  theme: AppTheme;
  
  /**
   * Whether the current theme is dark
   */
  isDark: boolean;
  
  /**
   * Toggle between light and dark theme
   */
  toggleTheme: () => void;
  
  /**
   * Set the theme to light or dark
   * @param isDark Whether to use dark theme
   */
  setTheme: (isDark: boolean) => void;
};

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  /**
   * The children to render
   */
  children: ReactNode;
  
  /**
   * The default theme to use
   * @default 'system'
   */
  defaultTheme?: 'light' | 'dark' | 'system';
  
  /**
   * Whether to persist the theme preference
   * @default true
   */
  persistTheme?: boolean;
  
  /**
   * The key to use for persisting the theme preference
   * @default '@app/theme-preference'
   */
  storageKey?: string;
}

/**
 * Theme provider component
 * @param props The component props
 * @returns The theme provider
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  persistTheme = true,
  storageKey = '@app/theme-preference',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(
    defaultTheme === 'dark' ? darkTheme : lightTheme
  );
  const [isDark, setIsDark] = useState<boolean>(defaultTheme === 'dark');

  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Load saved theme preference
  useEffect(() => {
    if (!persistTheme) return;

    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(storageKey) as 'light' | 'dark' | 'system' | null;
        
        if (savedPreference === 'system' || !savedPreference) {
          // Use system theme
          setIsDark(systemColorScheme === 'dark');
          setThemeState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        } else {
          // Use saved theme
          const isDarkTheme = savedPreference === 'dark';
          setIsDark(isDarkTheme);
          setThemeState(isDarkTheme ? darkTheme : lightTheme);
        }
      } catch (error: unknown) {
        console.error('Failed to load theme preference', error);
        // Fallback to system theme
        setIsDark(systemColorScheme === 'dark');
        setThemeState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
      }
    };

    loadThemePreference();
  }, [persistTheme, storageKey, systemColorScheme]);

  // Toggle between light and dark theme
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newIsDark = !prev;
      
      if (persistTheme) {
        AsyncStorage.setItem(storageKey, newIsDark ? 'dark' : 'light').catch((error: unknown) => {
          console.error('Failed to save theme preference', error);
        });
      }
      
      setThemeState(newIsDark ? darkTheme : lightTheme);
      return newIsDark;
    });
  }, [persistTheme, storageKey]);

  // Set the theme to light or dark
  const setThemeMode = useCallback((isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    
    if (persistTheme) {
      AsyncStorage.setItem(storageKey, isDarkMode ? 'dark' : 'light').catch((error: unknown) => {
        console.error('Failed to save theme preference', error);
      });
    }
    
    setThemeState(isDarkMode ? darkTheme : lightTheme);
  }, [persistTheme, storageKey]);

  // Create the context value
  const contextValue = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme: setThemeMode,
    }),
    [theme, isDark, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use the theme context
 * @returns The theme context
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  
  return context;
}

// Re-export the theme context
export { ThemeContext };

export default ThemeProvider;
