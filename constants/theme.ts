import { Dimensions } from 'react-native';
import colors from './colors';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

const theme = {
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
  },
  borderRadius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },
  typography: {
    fontSizes: {
      xs: 10,
      s: 12,
      m: 14,
      l: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      xxxxl: 28,
      display: 32,
      hero: 40,
    },
    fontWeights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
      black: '900' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },
  shadows: {
    small: {
      shadowColor: colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    large: {
      shadowColor: colors.shadow.dark,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    colored: {
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    glow: {
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
    },
  },
  gradients: {
    primary: {
      colors: colors.primaryGradient,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondary: {
      colors: colors.secondaryGradient,
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    background: {
      colors: colors.backgroundGradient,
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
};

export default theme;