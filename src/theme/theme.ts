import { Dimensions, Platform, StatusBar } from 'react-native';
import { type Theme } from '@react-navigation/native';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Platform
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';
const isWeb = Platform.OS === 'web';

// Status bar height
const statusBarHeight = isIOS ? 20 : StatusBar.currentHeight || 24;

// Navigation bar height (approximate)
const navigationBarHeight = isIOS ? 44 : 56;

// Tab bar height
const tabBarHeight = isIOS ? 49 : 56;

// Safe area insets
const safeAreaInsets = {
  top: statusBarHeight,
  bottom: isIOS ? 34 : 0, // Home indicator on iOS
  left: 0,
  right: 0,
};

// Spacing scale
const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
  '6xl': 72,
  '7xl': 80,
  '8xl': 96,
} as const;

// Border radius
const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Typography
const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

const fonts = {
  sans: {
    normal: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  mono: {
    normal: 'Menlo',
  },
} as const;

// Animation
const animation = {
  default: '200ms ease-in-out',
  fast: '100ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

// Z-index
const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Light theme colors
export const lightColors = {
  // Brand colors
  primary: '#007AFF',
  primaryLight: '#5D5FEB',
  primaryDark: '#004999',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F1F3F5',
  
  // Text colors
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textTertiary: '#6B7280',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F1F3F5',
  borderDark: '#D1D5DB',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Other colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  
  // Social colors
  facebook: '#1877F2',
  google: '#DB4437',
  apple: '#000000',
} as const;

// Dark theme colors
export const darkColors = {
  // Brand colors
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  
  // Background colors
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Border colors
  border: '#334155',
  borderLight: '#1E293B',
  borderDark: '#475569',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Other colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  
  // Social colors
  facebook: '#1877F2',
  google: '#DB4437',
  apple: '#FFFFFF',
} as const;

// Navigation theme
export const navigationLightTheme: Theme = {
  dark: false,
  colors: {
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.background,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.error,
  },
};

export const navigationDarkTheme: Theme = {
  dark: true,
  colors: {
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.background,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.error,
  },
};

// Export theme
export const theme = {
  // Dimensions
  width,
  height,
  isAndroid,
  isIOS,
  isWeb,
  statusBarHeight,
  navigationBarHeight,
  tabBarHeight,
  safeAreaInsets,
  
  // Spacing
  spacing,
  
  // Typography
  fontSizes,
  lineHeights,
  fontWeights,
  fonts,
  
  // Borders
  borderRadius,
  
  // Animation
  animation,
  
  // Z-index
  zIndex,
  
  // Colors (light by default, can be overridden)
  colors: lightColors,
  
  // Navigation theme (light by default)
  navigationTheme: navigationLightTheme,
} as const;

export type ThemeColors = typeof lightColors;
export type ThemeNavigationColors = Theme['colors'];

export type AppTheme = {
  colors: ThemeColors;
  navigationTheme: Theme;
} & Omit<typeof theme, 'colors' | 'navigationTheme'>;

// Create a function to get the theme with custom colors
export const createTheme = (colors: ThemeColors, isDark: boolean): AppTheme => ({
  ...theme,
  colors,
  navigationTheme: isDark ? navigationDarkTheme : navigationLightTheme,
});

// Export the default theme
export const lightTheme = createTheme(lightColors, false);
export const darkTheme = createTheme(darkColors, true);

export default theme;
