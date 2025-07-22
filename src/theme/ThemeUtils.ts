import { Platform, StatusBar } from 'react-native';
import type { AppTheme } from './theme';

/**
 * Get the status bar height based on the platform
 * @param theme The app theme
 * @returns The status bar height
 */
export const getStatusBarHeight = (theme: AppTheme) => {
  return Platform.select({
    ios: theme.statusBarHeight,
    android: StatusBar.currentHeight || theme.statusBarHeight,
    default: 0,
  });
};

/**
 * Create a shadow style based on the theme
 * @param elevation The elevation level (0-5)
 * @param theme The app theme
 * @returns The shadow style
 */
export const createShadow = (elevation: number = 2, theme: AppTheme) => {
  if (Platform.OS === 'android') {
    return {
      elevation,
      backgroundColor: theme.colors.background,
    };
  }

  // iOS shadow
  const shadowSizes = [
    { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } },
    {
      shadowOpacity: 0.1,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    {
      shadowOpacity: 0.15,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
    },
    {
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
    },
    {
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
    {
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
    },
  ];

  return {
    shadowColor: theme.colors.shadow || '#000',
    ...shadowSizes[Math.min(Math.max(elevation, 0), 5)],
  };
};

/**
 * Create a style with a background color and text color based on the theme
 * @param color The color key from the theme
 * @param theme The app theme
 * @returns The style object
 */
export const createColorStyle = (color: keyof AppTheme['colors'], theme: AppTheme) => {
  const backgroundColor = theme.colors[color] || color;
  
  // Check if the color is light or dark
  const isLight = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5;
  };
  
  const textColor = isLight(backgroundColor) ? theme.colors.text : theme.colors.textInverse;
  
  return {
    backgroundColor,
    color: textColor,
  };
};

/**
 * Create a style with a border color and width
 * @param color The border color
 * @param width The border width
 * @param position The border position (top, right, bottom, left, or all)
 * @returns The style object
 */
export const createBorder = (
  color: string = 'border',
  width: number = 1,
  position: 'top' | 'right' | 'bottom' | 'left' | 'all' = 'all'
) => {
  const borderStyle: any = {
    borderColor: color,
  };

  if (position === 'all') {
    borderStyle.borderWidth = width;
  } else {
    borderStyle[`border${position.charAt(0).toUpperCase() + position.slice(1)}Width`] = width;
    borderStyle[`border${position.charAt(0).toUpperCase() + position.slice(1)}Color`] = color;
  }

  return borderStyle;
};

/**
 * Create a style with a border radius
 * @param size The border radius size (xs, sm, md, lg, xl, 2xl, 3xl, full, or a number)
 * @param position The border radius position (top, right, bottom, left, or all)
 * @returns The style object
 */
export const createBorderRadius = (
  size: keyof AppTheme['borderRadius'] | number = 'md',
  position: 'top' | 'right' | 'bottom' | 'left' | 'all' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' = 'all'
) => {
  const borderRadiusStyle: any = {};
  
  if (typeof size === 'number') {
    if (position === 'all') {
      borderRadiusStyle.borderRadius = size;
    } else {
      borderRadiusStyle[`border${position.charAt(0).toUpperCase() + position.slice(1)}Radius`] = size;
    }
  } else {
    if (position === 'all') {
      borderRadiusStyle.borderRadius = `$${size}`;
    } else {
      borderRadiusStyle[`border${position.charAt(0).toUpperCase() + position.slice(1)}Radius`] = `$${size}`;
    }
  }
  
  return borderRadiusStyle;
};

/**
 * Create a style with a margin
 * @param size The margin size (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, or a number)
 * @param position The margin position (top, right, bottom, left, horizontal, vertical, or all)
 * @returns The style object
 */
export const createMargin = (
  size: keyof AppTheme['spacing'] | number = 'md',
  position: 'top' | 'right' | 'bottom' | 'left' | 'horizontal' | 'vertical' | 'all' = 'all'
) => {
  const marginStyle: any = {};
  
  if (position === 'all') {
    marginStyle.margin = typeof size === 'number' ? size : `$${size}`;
  } else if (position === 'horizontal') {
    marginStyle.marginHorizontal = typeof size === 'number' ? size : `$${size}`;
  } else if (position === 'vertical') {
    marginStyle.marginVertical = typeof size === 'number' ? size : `$${size}`;
  } else {
    marginStyle[`margin${position.charAt(0).toUpperCase() + position.slice(1)}`] = 
      typeof size === 'number' ? size : `$${size}`;
  }
  
  return marginStyle;
};

/**
 * Create a style with a padding
 * @param size The padding size (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, or a number)
 * @param position The padding position (top, right, bottom, left, horizontal, vertical, or all)
 * @returns The style object
 */
export const createPadding = (
  size: keyof AppTheme['spacing'] | number = 'md',
  position: 'top' | 'right' | 'bottom' | 'left' | 'horizontal' | 'vertical' | 'all' = 'all'
) => {
  const paddingStyle: any = {};
  
  if (position === 'all') {
    paddingStyle.padding = typeof size === 'number' ? size : `$${size}`;
  } else if (position === 'horizontal') {
    paddingStyle.paddingHorizontal = typeof size === 'number' ? size : `$${size}`;
  } else if (position === 'vertical') {
    paddingStyle.paddingVertical = typeof size === 'number' ? size : `$${size}`;
  } else {
    paddingStyle[`padding${position.charAt(0).toUpperCase() + position.slice(1)}`] = 
      typeof size === 'number' ? size : `$${size}`;
  }
  
  return paddingStyle;
};

/**
 * Create a style with a flex layout
 * @param direction The flex direction (row, column, row-reverse, column-reverse)
 * @param justify The justify content (flex-start, flex-end, center, space-between, space-around, space-evenly)
 * @param align The align items (flex-start, flex-end, center, baseline, stretch)
 * @param wrap The flex wrap (nowrap, wrap, wrap-reverse)
 * @returns The style object
 */
export const createFlex = (
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse' = 'row',
  justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' = 'flex-start',
  align: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' = 'stretch',
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse' = 'nowrap'
) => {
  return {
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
  };
};

/**
 * Create a style with a position
 * @param type The position type (absolute, relative, fixed)
 * @param top The top position
 * @param right The right position
 * @param bottom The bottom position
 * @param left The left position
 * @param zIndex The z-index
 * @returns The style object
 */
export const createPosition = (
  type: 'absolute' | 'relative' | 'fixed' = 'relative',
  top?: number | string,
  right?: number | string,
  bottom?: number | string,
  left?: number | string,
  zIndex?: number
) => {
  const positionStyle: any = {
    position: type,
  };
  
  if (top !== undefined) positionStyle.top = top;
  if (right !== undefined) positionStyle.right = right;
  if (bottom !== undefined) positionStyle.bottom = bottom;
  if (left !== undefined) positionStyle.left = left;
  if (zIndex !== undefined) positionStyle.zIndex = zIndex;
  
  return positionStyle;
};

/**
 * Helper function to create a style with a background color
 * @param color The color key from the theme or a color value
 * @returns The style object
 */
export const bgColor = (color: string) => ({
  backgroundColor: color,
});

/**
 * Helper function to create a style with a text color
 * @param color The color key from the theme or a color value
 * @returns The style object
 */
export const textColor = (color: string) => ({
  color,
});

/**
 * Helper function to create a style with a border color
 * @param color The color key from the theme or a color value
 * @returns The style object
 */
export const borderColor = (color: string) => ({
  borderColor: color,
});

/**
 * Helper function to create a style with a border width
 * @param width The border width
 * @returns The style object
 */
export const borderWidth = (width: number) => ({
  borderWidth: width,
});

/**
 * Helper function to create a style with a border radius
 * @param radius The border radius
 * @returns The style object
 */
export const borderRadius = (radius: number) => ({
  borderRadius: radius,
});

/**
 * Helper function to create a style with a margin
 * @param size The margin size
 * @returns The style object
 */
export const margin = (size: number) => ({
  margin: size,
});

/**
 * Helper function to create a style with a padding
 * @param size The padding size
 * @returns The style object
 */
export const padding = (size: number) => ({
  padding: size,
});

export default {
  getStatusBarHeight,
  createShadow,
  createColorStyle,
  createBorder,
  createBorderRadius,
  createMargin,
  createPadding,
  createFlex,
  createPosition,
  bgColor,
  textColor,
  borderColor,
  borderWidth,
  borderRadius,
  margin,
  padding,
};
