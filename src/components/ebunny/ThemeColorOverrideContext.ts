import { createContext } from 'react';
import type { ThemeColors } from '@/types/theme';

/** The provider owns the document palette; consumers only read this override. */
export const ThemeColorOverrideContext = createContext<ThemeColors | null>(null);
