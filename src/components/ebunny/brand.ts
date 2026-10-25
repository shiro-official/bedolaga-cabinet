import type { ThemeColors } from '@/types/theme';

/** Brand presentation only; the operator palette remains available in /admin. */
export const isEbunnyPath = (pathname: string) =>
  pathname !== '/admin' && !pathname.startsWith('/admin/');

export const EBUNNY_COLORS: ThemeColors = {
  accent: '#ff87bb',
  darkBackground: '#1c1d22',
  darkSurface: '#23242c',
  darkText: '#fff4df',
  darkTextSecondary: '#b9b6c0',
  lightBackground: '#f7f0e1',
  lightSurface: '#fffaf0',
  lightText: '#25212b',
  lightTextSecondary: '#625b69',
  success: '#83aa45',
  warning: '#e5a83e',
  error: '#ef626d',
};
