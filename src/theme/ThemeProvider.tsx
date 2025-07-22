import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme } from './theme';

type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (defaultTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return defaultTheme === 'dark';
  });

  // Update theme when system color scheme changes
  useEffect(() => {
    if (defaultTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, defaultTheme]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme hook that returns the current theme values
export const useAppTheme = (): AppTheme => {
  const { theme } = useTheme();
  return theme;
};

// Theme hook that returns the current theme colors
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

// Theme hook that returns the current theme mode
export const useThemeMode = () => {
  const { isDark } = useTheme();
  return { isDark };
};

// Theme toggle hook
export const useThemeToggle = () => {
  const { toggleTheme, setTheme } = useTheme();
  return { toggleTheme, setTheme };
};
