import { AppTheme } from './theme';

declare module 'react-native' {
  interface ViewStyle {
    // Add any custom view style properties here
  }
  
  interface TextStyle {
    // Add any custom text style properties here
    fontFamily?: string;
    letterSpacing?: number;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined;
  }
  
  interface ImageStyle {
    // Add any custom image style properties here
  }
}

declare module '@react-navigation/native' {
  export interface Theme {
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      [key: string]: any;
    };
    dark: boolean;
  }
}

declare module 'nativewind' {
  interface Theme extends AppTheme {}
}

declare module '@emotion/native' {
  export interface Theme extends AppTheme {}
}

declare module '@emotion/react' {
  export interface Theme extends AppTheme {}
}
