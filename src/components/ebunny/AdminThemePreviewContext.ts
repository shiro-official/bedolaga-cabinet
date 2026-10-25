import { createContext } from 'react';

/** Presentation only: keep the existing live theme editor functional. */
export const AdminThemePreviewContext = createContext<(active: boolean) => void>(() => {});
