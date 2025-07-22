import React from 'react';
import { useTheme } from './ThemeProvider';
import type { AppTheme } from './theme';

/**
 * Higher Order Component that provides the theme to a component
 * @param WrappedComponent The component to wrap with theme
 * @returns A component with theme props
 */
export function withTheme<T extends { theme?: AppTheme }>(
  WrappedComponent: React.ComponentType<T>
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithTheme = (props: Omit<T, 'theme'>) => {
    const { theme } = useTheme();
    
    return <WrappedComponent {...(props as T)} theme={theme} />;
  };

  ComponentWithTheme.displayName = `withTheme(${displayName})`;

  return ComponentWithTheme;
}

/**
 * Hook that returns the current theme
 * @returns The current theme
 */
// Re-export useTheme from ThemeProvider
export { useTheme } from './ThemeProvider';

/**
 * Hook that returns the current theme colors
 * @returns The current theme colors
 */
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook that returns the current spacing values
 * @returns The current spacing values
 */
export function useSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

/**
 * Hook that returns the current typography values
 * @returns The current typography values
 */
export function useTypography() {
  const { theme } = useTheme();
  // Return the typography properties that exist in the theme
  return {
    ...(theme.fonts && { fonts: theme.fonts }),
    ...(theme.fontSizes && { fontSizes: theme.fontSizes }),
    ...(theme.fontWeights && { fontWeights: theme.fontWeights }),
    ...(theme.lineHeights && { lineHeights: theme.lineHeights })
  };
}

/**
 * Hook that returns the current border radius values
 * @returns The current border radius values
 */
export function useBorderRadius() {
  const { theme } = useTheme();
  return theme.borderRadius;
}

/**
 * Hook that returns the current animation values
 * @returns The current animation values
 */
export function useAnimations() {
  const { theme } = useTheme();
  return theme.animation;
}

/**
 * Hook that returns the current z-index values
 * @returns The current z-index values
 */
export function useZIndex() {
  const { theme } = useTheme();
  return theme.zIndex;
}

export default withTheme;
