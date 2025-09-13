'use client';

import { ThemeProvider as NextThemeProvider, type ThemeProviderProps as NextThemeProviderProps } from 'next-themes';

interface ThemeProviderProps extends Omit<NextThemeProviderProps, 'children'> {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemeProvider {...props}>
      {children}
    </NextThemeProvider>
  );
}