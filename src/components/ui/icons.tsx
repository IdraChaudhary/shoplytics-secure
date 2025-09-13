/**
 * Icon components used throughout the application.
 * Using a central icon registry helps with consistency and maintainability.
 */

import {
  Moon,
  Sun,
  Icon as LucideIcon,
} from 'lucide-react';

export type Icon = typeof LucideIcon;

export const Icons = {
  sun: Sun,
  moon: Moon,
} as const;