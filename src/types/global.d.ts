/// <reference types="expo-router/types" />

// Extend the NodeJS namespace for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}

// Type declarations for modules without types
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Global type declarations
type Nullable<T> = T | null;

type Optional<T> = T | undefined;

// Extend the global object
declare global {
  // Add any global types here
  // Example:
  // interface Window {
  //   myGlobalFunction: () => void;
  // }
}

// This file is used to extend the global scope with custom types
export {};
