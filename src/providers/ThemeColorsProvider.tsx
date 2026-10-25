import { AdminThemePreviewContext } from '@/components/ebunny/AdminThemePreviewContext';
import { ThemeColorOverrideContext } from '@/components/ebunny/ThemeColorOverrideContext';
import { useEffect, useLayoutEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router';
import { EBUNNY_COLORS, isEbunnyPath } from '@/components/ebunny/brand';
import { useQuery } from '@tanstack/react-query';
import { themeColorsQueryOptions } from '../api/themeColors';
import { DEFAULT_THEME_COLORS } from '../types/theme';
import { applyThemeColors } from '../hooks/useThemeColors';
import { usePlatform } from '@/platform';
import { useTheme } from '../hooks/useTheme';

interface ThemeColorsProviderProps {
  children: React.ReactNode;
}

export function ThemeColorsProvider({ children }: ThemeColorsProviderProps) {
  const { data: colors } = useQuery(themeColorsQueryOptions());

  const { theme: platformTheme, capabilities } = usePlatform();
  const { isDark } = useTheme();
  const { pathname } = useLocation();
  const ebunny = isEbunnyPath(pathname);
  const [adminThemePreview, setAdminThemePreview] = useState(false);
  // Only the existing theme editor may temporarily preview its draft palette.
  const preview = !ebunny && adminThemePreview;
  const effectiveColors = preview ? colors || DEFAULT_THEME_COLORS : EBUNNY_COLORS;

  useLayoutEffect(() => {
    if (ebunny) document.documentElement.dataset.ebunny = 'true';
    else delete document.documentElement.dataset.ebunny;
    if (!ebunny) document.documentElement.dataset.ebunnyAdmin = 'true';
    else delete document.documentElement.dataset.ebunnyAdmin;
    applyThemeColors(effectiveColors);
    return () => {
      delete document.documentElement.dataset.ebunny;
      delete document.documentElement.dataset.ebunnyAdmin;
    };
  }, [ebunny, effectiveColors]);

  // Sync Telegram header and bottom bar colors with theme
  const syncTelegramColors = useCallback(() => {
    if (!capabilities.hasThemeSync) return;

    const themeColors = effectiveColors;
    // Use surface color for header/bottom bar to match app UI
    const headerColor = isDark ? themeColors.darkSurface : themeColors.lightSurface;
    // Фон клиента под страницей — тот же, что у самой страницы. Иначе на
    // Android всё, что WebView не успел отрисовать, просвечивает цветом
    // клиента: чёрные прямоугольники и «прыгающие» цвета на Xiaomi.
    const pageColor = isDark ? themeColors.darkBackground : themeColors.lightBackground;

    platformTheme.setHeaderColor(headerColor);
    platformTheme.setBottomBarColor(headerColor);
    platformTheme.setBackgroundColor(pageColor);
  }, [capabilities.hasThemeSync, effectiveColors, isDark, platformTheme]);

  // Apply Telegram colors when theme or colors change
  useEffect(() => {
    syncTelegramColors();
  }, [syncTelegramColors]);

  return (
    <AdminThemePreviewContext.Provider value={setAdminThemePreview}>
      <ThemeColorOverrideContext.Provider value={preview ? null : EBUNNY_COLORS}>
        {children}
      </ThemeColorOverrideContext.Provider>
    </AdminThemePreviewContext.Provider>
  );
}
