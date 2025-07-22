declare module '@nkzw/create-context-hook' {
  import { Context, ReactNode } from 'react';

  type HookFunction<T> = (props?: any) => T;
  type ProviderProps = { children?: ReactNode; value?: any };
  
  export default function createContextHook<T>(
    useHook: HookFunction<T>,
    displayName?: string
  ): [
    (props?: any) => T,
    (props: ProviderProps) => JSX.Element,
    Context<T | undefined>
  ];
}
