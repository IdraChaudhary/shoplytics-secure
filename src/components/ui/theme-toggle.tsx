'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
// Update the import path if your icons file is located elsewhere, for example:
import { Icons } from './icons';
// Or, if you need to create the file, add src/components/ui/icons.tsx with the following content:

// Example icons.tsx
// export const Icons = {
//   sun: (props: React.SVGProps<SVGSVGElement>) => (
//     <svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>
//   ),
//   moon: (props: React.SVGProps<SVGSVGElement>) => (
//     <svg {...props} viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
//   ),
// };

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Icons.sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Icons.moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}